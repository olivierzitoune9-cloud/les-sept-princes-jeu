import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPilotMatch } from '@engine/match.js'
import { SeededRandom } from '@engine/random.js'
import { installPossession } from '@engine/possession.js'
import { observeDynamicGaps } from '@engine/spatial.js'
import {
  chooseVolleyDefense,
  matchLengthSeconds,
  resolveVolley,
  validateVolleyPlan,
  MINOR_INTENTS,
  type AttackVolleyIntent,
  type DefensePlan,
  type VolleyOrder,
  type VolleyPlan
} from '@engine/volley.js'
import type { GapObservation } from '@engine/spatial.js'
import type { MatchState, MatchEvent, PlayerRole, TeamId } from '@engine/types.js'
import type { TacticalTrajectory, OpenIntervalMarker } from '../utils/fieldRenderer'

// Boucle vollee V0 sandbox (D-019, spec 19) : le temps de match n'avance que
// par volees. Ici l'attaque planifie, la defense repond par doctrine aveugle
// (jamais en reaction au plan), puis resolveVolley simule 3 a 5 s a tick
// strict avec arret anticipe sur evenement majeur.

export type VolleyPhase = 'plan' | 'resolved'

export interface VolleyDraftOrder extends VolleyOrder {
  id: string
}

export interface PlannedVolley {
  orders: VolleyOrder[]
  defense: DefensePlan
  durationSeconds: number
  endedEarly: boolean
  endReason: string
  gaps: GapObservation[]
  causalLines: string[]
}

// Duree FIFA configurable (spec 19 §3) : minutes par mi-temps au choix,
// defaut deux fois 10 minutes simulees.
export const DEFAULT_MATCH_MINUTES_PER_HALF = 10

export function defaultHalfSeconds(minutesPerHalf: number = DEFAULT_MATCH_MINUTES_PER_HALF): number {
  return minutesPerHalf * 60
}

export function createVolleyMatch(seed = 44): MatchState {
  return createPilotMatch(seed)
}

// Placement au coup d'envoi (D-022) : une vraie attaque placee a 9 m face a
// une vraie ligne 6-0 a 6 m, gardiens dans leur but. Le handball commence
// par cette image, pas par une transition.
const KICKOFF_ATTACK: Record<string, { x: number; y: number }> = {
  yanis: { x: 29, y: 10 },   // demi-centre, legerement en retrait
  erwan: { x: 28.5, y: 5.5 },
  aaron: { x: 28.5, y: 14.5 },
  pierre: { x: 32, y: 1.8 },
  elian: { x: 32, y: 18.2 },
  edgar: { x: 33.5, y: 10 },
  liam: { x: 1.2, y: 10 }
}
const KICKOFF_DEFENSE: Record<string, { x: number; y: number }> = {
  malone: { x: 34, y: 3 },
  mael: { x: 34, y: 6.4 },
  kael: { x: 34, y: 10 },
  elio: { x: 34, y: 13.6 },
  neo: { x: 34, y: 17 },
  karim: { x: 35.6, y: 10 },
  teddy: { x: 38.8, y: 10 }
}

function mirrorSpots(spots: Record<string, { x: number; y: number }>): Record<string, { x: number; y: number }> {
  // Miroir attaque/defense : la meme formation pour l'autre cote du terrain.
  const mirrored: Record<string, { x: number; y: number }> = {}
  for (const [id, spot] of Object.entries(spots)) {
    mirrored[id] = { x: 40 - spot.x, y: spot.y }
  }
  return mirrored
}

export function installKickoff(state: MatchState, attackingTeam: TeamId): MatchState {
  const next = structuredClone(state)
  const attackSpots = attackingTeam === 'nangis' ? KICKOFF_ATTACK : mirrorSpots(KICKOFF_ATTACK)
  const defenseSpots = attackingTeam === 'nangis' ? KICKOFF_DEFENSE : mirrorSpots(KICKOFF_DEFENSE)
  const defendingTeam: TeamId = attackingTeam === 'nangis' ? 'lagny' : 'nangis'
  for (const player of Object.values(next.players)) {
    if (!player.isOnCourt) continue
    const spot = (player.team === attackingTeam ? attackSpots : defenseSpots)[player.id]
    if (spot) player.position = { ...spot }
  }
  const holder = next.players[next.ball.holderId]
  if (holder) next.ball.position = { ...holder.position }
  next.possessionPhase = 'live'
  next.teams[attackingTeam].possession = true
  next.teams[defendingTeam].possession = false
  return next
}

let draftCounter = 0

function nextDraftId(): string {
  draftCounter += 1
  return `ordre-${draftCounter}`
}

// Ordre par defaut propose a l'ouverture d'une volee : le porteur avance
// d'abord (une fleche = une intention), le coach ajuste ensuite.
export function suggestOpeningDraft(state: MatchState, team: TeamId): VolleyDraftOrder[] {
  const holderId = state.ball.holderId
  const holder = state.players[holderId]
  if (!holder || holder.team !== team) return []
  const direction = team === 'nangis' ? 1 : -1
  return [
    {
      id: nextDraftId(),
      actorId: holderId,
      kind: 'move' as AttackVolleyIntent,
      targetPosition: { x: holder.position.x + direction * 4, y: holder.position.y }
    }
  ]
}

export function draftToPlan(state: MatchState, team: TeamId, draft: VolleyDraftOrder[]): VolleyPlan {
  return {
    team,
    orders: draft.map((order) => {
      const { id: _ignored, ...rest } = order
      return rest
    })
  }
}

export function validateDraft(
  state: MatchState,
  team: TeamId,
  draft: VolleyDraftOrder[]
): { ok: boolean; message: string | null } {
  try {
    validateVolleyPlan(state, draftToPlan(state, team, draft), chooseVolleyDefense(state, team))
    return { ok: true, message: null }
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Plan invalide' }
  }
}

// IA d'attaque minimale pour le camp non coache : passe au partenaire le
// plus proche du but adverse ou avancee du porteur. Aucune lecture du plan
// adverse, doctrine symetrique de chooseVolleyDefense.
export function chooseVolleyAttack(state: MatchState, team: TeamId): VolleyPlan {
  const holder = state.players[state.ball.holderId]
  if (!holder || holder.team !== team) return { team, orders: [] }
  const goalX = team === 'nangis' ? 40 : 0
  const mates = Object.values(state.players).filter(
    (player) => player.team === team && player.isOnCourt && player.role !== 'goalkeeper' && player.id !== holder.id
  )
  const best = mates
    .map((mate) => ({ mate, score: goalX === 40 ? mate.position.x : 40 - mate.position.x }))
    .sort((first, second) => second.score - first.score)[0]?.mate
  if (best) return { team, orders: [{ actorId: holder.id, kind: 'pass', targetId: best.id }] }
  const direction = team === 'nangis' ? 1 : -1
  return {
    team,
    orders: [{ actorId: holder.id, kind: 'move', targetPosition: { x: holder.position.x + direction * 4, y: holder.position.y } }]
  }
}

function causalLinesFor(state: MatchState, count: number): string[] {
  return state.events.slice(-count).map((event) => {
    const actor = event.actorId ? state.players[event.actorId]?.name ?? event.actorId : '—'
    const target = event.targetId ? ` ➔ ${state.players[event.targetId]?.name ?? event.targetId}` : ''
    const causes = (event.causes ?? []).join(' · ')
    return `${event.type} ${event.result} — ${actor}${target}${causes ? ` (${causes})` : ''}`
  })
}

export function resolveVolleyTurn(
  state: MatchState,
  attack: VolleyPlan,
  defense: DefensePlan,
  seed: number
): { state: MatchState; planned: PlannedVolley } {
  const before = state.events.length
  const random = new SeededRandom(seed + state.events.length * 31 + Math.floor(state.timeSeconds * 7))
  const result = resolveVolley(state, attack, defense, random)
  let next = result.state
  // Fin de possession sur evenement terminal (spec 19 §2) : le ballon repart
  // de l'autre cote, l'horloge a deja avance de la duree de la volee.
  if (result.possessionChanged) {
    const attackingStill = next.teams[attack.team].possession
    if (attackingStill) {
      const other: TeamId = attack.team === 'nangis' ? 'lagny' : 'nangis'
      const restart = result.endReason === 'goal' ? 'centre' : result.endReason === 'save' ? 'goalkeeper' : 'interception'
      next = installPossession(next, other, restart)
    }
  }
  const produced = next.events.length - before
  const gaps = observeDynamicGaps(next, next.teams.nangis.possession ? 'nangis' : 'lagny')
  return {
    state: next,
    planned: {
      orders: attack.orders,
      defense,
      durationSeconds: result.durationSeconds,
      endedEarly: result.endedEarly,
      endReason: result.endReason,
      gaps,
      causalLines: causalLinesFor(next, Math.max(produced, 3))
    }
  }
}

export { chooseVolleyDefense, matchLengthSeconds }
const playerNumbers: Record<string, number> = {
  pierre: 11, erwan: 9, yanis: 7, aaron: 8, elian: 13, edgar: 6, liam: 1,
  leo: 10, ilyes: 12,
  malone: 17, mael: 15, kael: 14, elio: 16, neo: 19, karim: 18, teddy: 1,
  layo: 20, rio: 21
}

export interface VolleyUIPlayer {
  id: string
  name: string
  number: number
  team: 'nangis' | 'lagny'
  role?: string
  hasBall?: boolean
  position: { x: number; y: number }
}

// Rail droit (D-021) : le joueur selectionne et le defenseur le plus proche
// du porteur, avec les observables du moteur. Les jauges resument des faits
// calcules par le moteur, jamais des mecanismes (spec 19 §6).
export interface VolleyUIThreat {
  id: string
  name: string
  number: number
  distanceMeters: number
  defense: number
  duel: number
  acceleration: number
  anticipation: number
}

export interface VolleyUISelected {
  id: string
  name: string
  number: number
  role: PlayerRole
  team: TeamId
  energy: number
  pressure: number
  hasBall: boolean
}

export interface VolleyUIMatch {
  players: VolleyUIPlayer[]
  ball: { position: { x: number; y: number } }
  score: { nangis: number; lagny: number }
  time: number
  possession: 'nangis' | 'lagny'
}

function toUIMatch(next: MatchState): VolleyUIMatch {
  const players: VolleyUIPlayer[] = Object.values(next.players)
    .filter((p) => p.isOnCourt)
    .map((p) => ({
      id: p.id,
      name: p.name,
      number: playerNumbers[p.id] ?? 99,
      team: p.team,
      role: p.role,
      hasBall: next.ball.holderId === p.id,
      position: { ...p.position }
    }))
  return {
    players,
    ball: { position: { ...next.ball.position } },
    score: { nangis: next.teams.nangis.score, lagny: next.teams.lagny.score },
    time: next.timeSeconds,
    possession: next.teams.nangis.possession ? 'nangis' : 'lagny'
  }
}

function draftTrajectories(draft: VolleyDraftOrder[], state: MatchState | null): TacticalTrajectory[] {
  if (!state) return []
  return draft.map((order) => {
    const actor = state.players[order.actorId]
    const from = actor ? { ...actor.position } : { x: 20, y: 10 }
    if (order.kind === 'pass' && order.targetId) {
      const target = state.players[order.targetId]
      return { id: `draft-${order.id}`, actionId: order.id, type: 'pass', from, to: target ? { ...target.position } : from, label: 'Passe envisagee', targetPlayerId: order.targetId, risk: 'moderate' as const }
    }
    if (order.kind === 'fix' && order.targetId) {
      const target = state.players[order.targetId]
      return { id: `draft-${order.id}`, actionId: order.id, type: 'fix', from, to: target ? { ...target.position } : from, label: 'Fixation envisagee', targetPlayerId: order.targetId }
    }
    if (order.kind === 'shoot') {
      const goalX = actor && actor.team === 'nangis' ? 40 : 0
      return { id: `draft-${order.id}`, actionId: order.id, type: 'shoot', from, to: { x: goalX, y: 10 }, label: 'Tir envisage' }
    }
    return { id: `draft-${order.id}`, actionId: order.id, type: order.kind as TacticalTrajectory['type'], from, to: order.targetPosition ? { ...order.targetPosition } : from, label: 'Course envisagee' }
  })
}

export function useVolleyMatch(seed = 44, minutesPerHalf: number = DEFAULT_MATCH_MINUTES_PER_HALF) {
  const [engineState, setEngineState] = useState<MatchState | null>(null)
  const [match, setMatch] = useState<VolleyUIMatch | null>(null)
  const [draft, setDraft] = useState<VolleyDraftOrder[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [lastVolley, setLastVolley] = useState<PlannedVolley | null>(null)
  const [volleyCount, setVolleyCount] = useState(0)
  const [pendingKind, setPendingKind] = useState<AttackVolleyIntent | null>(null)
  // Chronologie du match (D-022) : le rapport de fin liste les evenements
  // majeurs (buts, arrets, interceptions) avec leur temps, depuis le moteur.
  const [timeline, setTimeline] = useState<MatchEvent[]>([])
  const seedRef = useRef(seed)
  const matchSeconds = defaultHalfSeconds(minutesPerHalf) * 2

  const start = useCallback(() => {
    // Coup d'envoi en vraie attaque placee (D-022) : 7 contre 7, gardiens
    // dans leur but, plan vide — c'est le coach qui decide, pas le moteur.
    const initial = installKickoff(createVolleyMatch(seedRef.current), 'nangis')
    setEngineState(initial)
    setMatch(toUIMatch(initial))
    draftCounter = 0
    setDraft([])
    setSelectedId(initial.ball.holderId)
    setLastVolley(null)
    setVolleyCount(0)
    setPendingKind(null)
    setTimeline([])
  }, [])

  useEffect(() => { start() }, [start])

  const attackingTeam: TeamId = engineState ? (engineState.teams.nangis.possession ? 'nangis' : 'lagny') : 'nangis'
  const holderId = engineState?.ball.holderId ?? null

  const addOrder = useCallback((kind: AttackVolleyIntent, targetId?: string) => {
    const current = engineState
    if (!current) return
    // Tir et passe partent toujours du porteur (validation moteur).
    if (kind === 'shoot') {
      const holder = current.ball.holderId
      if (!current.players[holder]) return
      setDraft((prev) => [...prev, { id: `ordre-${Date.now()}-${Math.floor(Math.random() * 9999)}`, actorId: holder, kind }])
      setPendingKind(null)
      return
    }
    if (kind === 'pass') {
      const holder = current.ball.holderId
      if (!targetId) { setPendingKind('pass'); return }
      if (!current.players[targetId]) return
      setDraft((prev) => [...prev, { id: `ordre-${Date.now()}-${Math.floor(Math.random() * 9999)}`, actorId: holder, kind, targetId }])
      setPendingKind(null)
      return
    }
    if (kind === 'fix') {
      if (!targetId) { setPendingKind('fix'); return }
      const actorId = selectedId ?? current.ball.holderId
      if (!current.players[actorId] || !current.players[targetId]) return
      setDraft((prev) => [...prev, { id: `ordre-${Date.now()}-${Math.floor(Math.random() * 9999)}`, actorId, kind, targetId }])
      setPendingKind(null)
      return
    }
    if (kind === 'move' || kind === 'attackSpace' || kind === 'cut' || kind === 'stretch') {
      const actorId = selectedId ?? current.ball.holderId
      const actor = current.players[actorId]
      if (!actor) return
      const order: VolleyDraftOrder = { id: `ordre-${Date.now()}-${Math.floor(Math.random() * 9999)}`, actorId, kind }
      const dir = actor.team === 'nangis' ? 1 : -1
      if (targetId && current.players[targetId]) {
        const target = current.players[targetId]
        order.targetPosition = { ...target.position }
        if (target.team === actor.team && targetId !== actorId) order.actorId = targetId
      } else {
        order.targetPosition = { x: actor.position.x + dir * 3, y: actor.position.y }
      }
      setDraft((prev) => [...prev, order])
      // On garde l'intention en attente : le clic terrain suivant affine la fleche.
      setPendingKind(kind)
      return
    }
    // support et autres : creation directe.
    const actorId = selectedId ?? current.ball.holderId
    if (!current.players[actorId]) return
    setDraft((prev) => [...prev, { id: `ordre-${Date.now()}-${Math.floor(Math.random() * 9999)}`, actorId, kind, targetPosition: targetId && current.players[targetId] ? { ...current.players[targetId].position } : undefined }])
    setPendingKind(null)
  }, [engineState, selectedId])

  // Clic sur un joueur (terrain ou listes) : termine l'intention en attente
  // ou selectionne simplement. C'est ce qui rend passe et fixation posables.
  const clickPlayer = useCallback((playerId: string) => {
    const current = engineState
    if (!current || !current.players[playerId]) return
    const target = current.players[playerId]
    const holder = current.players[current.ball.holderId]
    // Passe : uniquement vers un partenaire du porteur.
    if (pendingKind === 'pass') {
      if (!holder || target.team !== holder.team) return
      setDraft((prev) => [...prev, { id: `ordre-${Date.now()}-${Math.floor(Math.random() * 9999)}`, actorId: holder.id, kind: 'pass', targetId: playerId }])
      setPendingKind(null)
      return
    }
    setSelectedId(playerId)
    // Fixation : uniquement un defenseur adverse.
    if (pendingKind === 'fix') {
      const actorId = selectedId ?? current.ball.holderId
      const actor = current.players[actorId]
      if (!actor || target.team === actor.team) return
      setDraft((prev) => [...prev, { id: `ordre-${Date.now()}-${Math.floor(Math.random() * 9999)}`, actorId, kind: 'fix', targetId: playerId }])
      setPendingKind(null)
      return
    }
    if (pendingKind === 'move' || pendingKind === 'attackSpace' || pendingKind === 'cut' || pendingKind === 'stretch') {
      const target = current.players[playerId]
      setDraft((prev) => {
        if (prev.length === 0) return prev
        const copy = [...prev]
        const last = { ...copy[copy.length - 1] }
        if (last.kind !== pendingKind) return prev
        last.targetPosition = { ...target.position }
        const anchor = current.players[last.actorId]
        if (anchor && target.team === anchor.team && playerId !== last.actorId) last.actorId = playerId
        copy[copy.length - 1] = last
        return copy
      })
      setPendingKind(null)
      return
    }
  }, [engineState, pendingKind, selectedId])

  // Clic terrain : affine la derniere fleche spatiale ou cree Attaquer.
  const clickCourt = useCallback((point: { x: number; y: number }) => {
    const current = engineState
    if (!current) return
    // Une passe ou fixation en attente attend un joueur, pas un point.
    if (pendingKind === 'pass' || pendingKind === 'fix') return
    if (pendingKind === 'move' || pendingKind === 'attackSpace' || pendingKind === 'cut' || pendingKind === 'stretch') {
      setDraft((prev) => {
        if (prev.length === 0) return prev
        const copy = [...prev]
        const last = { ...copy[copy.length - 1] }
        if (last.kind !== pendingKind) return prev
        last.targetPosition = { ...point }
        copy[copy.length - 1] = last
        return copy
      })
      setPendingKind(null)
      return
    }
    aimLastAtPoint(point)
  }, [engineState, pendingKind])

  const setTargetForLast = useCallback((targetId: string) => {
    const current = engineState
    setDraft((prev) => {
      if (prev.length === 0) return prev
      const copy = [...prev]
      const last = { ...copy[copy.length - 1] }
      if (last.kind === 'pass' || last.kind === 'fix') {
        last.targetId = targetId
      } else {
        const target = current?.players[targetId]
        if (target) last.targetPosition = { ...target.position }
        const anchor = current?.players[last.actorId]
        if (target && anchor && target.team === anchor.team && targetId !== last.actorId) {
          if (last.kind === 'move' || last.kind === 'attackSpace' || last.kind === 'cut' || last.kind === 'stretch') last.actorId = targetId
        }
      }
      copy[copy.length - 1] = last
      return copy
    })
  }, [engineState])

  const aimLastAtPoint = useCallback((point: { x: number; y: number }) => {
    const current = engineState
    setDraft((prev) => {
      if (prev.length === 0) {
        const actorId = selectedId ?? current?.ball.holderId
        if (!current || !actorId) return prev
        return [{ id: `ordre-${Date.now()}`, actorId, kind: 'attackSpace', targetPosition: { ...point } }]
      }
      const copy = [...prev]
      const last = { ...copy[copy.length - 1] }
      if (last.kind === 'pass' || last.kind === 'shoot' || last.kind === 'fix') return prev
      last.targetPosition = { ...point }
      copy[copy.length - 1] = last
      return copy
    })
  }, [engineState, selectedId])

  const removeOrder = useCallback((id: string) => {
    setDraft((prev) => prev.filter((order) => order.id !== id))
    setPendingKind(null)
  }, [])

  const clearDraft = useCallback(() => { setDraft([]); setPendingKind(null) }, [])

  const autoPlan = useCallback(() => {
    const current = engineState
    if (!current) return
    const team: TeamId = current.teams.nangis.possession ? 'nangis' : 'lagny'
    const plan = chooseVolleyAttack(current, team)
    const mapped: VolleyDraftOrder[] = plan.orders.map((order, index) => ({ ...order, id: `ordre-ia-${index}` }))
    setDraft(mapped.length > 0 ? mapped : suggestOpeningDraft(current, team))
    setSelectedId(current.ball.holderId)
    setPendingKind(null)
  }, [engineState])

  const budget = useMemo(() => {
    const major = draft.filter((order) => !MINOR_INTENTS.includes(order.kind)).length
    const minor = draft.filter((order) => MINOR_INTENTS.includes(order.kind)).length
    return { major, minor }
  }, [draft])

  const validation = useMemo(() => {
    if (!engineState || draft.length === 0) return null
    const check = validateDraft(engineState, attackingTeam, draft)
    return check.ok ? null : check.message
  }, [engineState, draft, attackingTeam])

  const gaps = useMemo(() => {
    if (!engineState) return []
    return observeDynamicGaps(engineState, attackingTeam)
  }, [engineState, attackingTeam])

  // Rail droit (D-021) : observables moteur du joueur selectionne.
  const selectedInfo = useMemo<VolleyUISelected | null>(() => {
    if (!engineState) return null
    const p = engineState.players[selectedId ?? engineState.ball.holderId]
    if (!p) return null
    return {
      id: p.id,
      name: p.name,
      number: playerNumbers[p.id] ?? 99,
      role: p.role,
      team: p.team,
      energy: Math.round(p.energy),
      pressure: Math.round(p.pressure),
      hasBall: engineState.ball.holderId === p.id
    }
  }, [engineState, selectedId])

  // Menaces : les trois defenseurs les plus proches du porteur, distance reelle.
  const threats = useMemo<VolleyUIThreat[]>(() => {
    if (!engineState) return []
    const holder = engineState.players[engineState.ball.holderId]
    if (!holder) return []
    const defending: TeamId = holder.team === 'nangis' ? 'lagny' : 'nangis'
    return Object.values(engineState.players)
      .filter((p) => p.team === defending && p.isOnCourt && p.role !== 'goalkeeper')
      .map((p) => ({
        id: p.id,
        name: p.name,
        number: playerNumbers[p.id] ?? 99,
        distanceMeters: Math.hypot(p.position.x - holder.position.x, p.position.y - holder.position.y),
        defense: Math.round(p.defense),
        duel: Math.round(p.duel),
        acceleration: Math.round(p.acceleration),
        anticipation: Math.round(p.anticipation)
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 3)
  }, [engineState])

  const gapMarkers: OpenIntervalMarker[] = useMemo(() => {
    return gaps.filter((gap) => gap.width >= 1.4).map((gap) => ({
      id: gap.id,
      point: gap.point,
      openness: gap.exploitable ? 0.9 : Math.max(0.35, Math.min(0.7, gap.width / 6))
    }))
  }, [gaps])

  const trajectories = useMemo(() => draftTrajectories(draft, engineState), [draft, engineState])

  const lockAndResolve = useCallback(() => {
    const current = engineState
    if (!current) return
    const team: TeamId = current.teams.nangis.possession ? 'nangis' : 'lagny'
    if (team === 'nangis' && draft.length === 0) return
    const attack = team === 'nangis' ? draftToPlan(current, team, draft) : chooseVolleyAttack(current, team)
    const defense = chooseVolleyDefense(current, team)
    const { state: next, planned } = resolveVolleyTurn(current, attack, defense, seedRef.current)
    setEngineState(next)
    setMatch(toUIMatch(next))
    setLastVolley({ ...planned, defense })
    setVolleyCount((count) => count + 1)
    // Chronologie : les evenements majeurs de la volee alimentent le rapport.
    const MAJOR = new Set(['goal', 'save', 'interception', 'shot', 'turnover'])
    setTimeline((prev) => [...prev, ...next.events.filter((event) => MAJOR.has(event.type))].slice(-60))
    draftCounter = 0
    // D-023 : plan vide apres chaque volee — le coach decide, le moteur
    // n'avance jamais le porteur sans ordre explicite.
    setDraft([])
    setSelectedId(next.ball.holderId)
    setPendingKind(null)
  }, [engineState, draft])

  const isOver = match ? match.time >= matchSeconds : false

  return {
    engineState, match, draft, trajectories, gapMarkers, gaps,
    selectedInfo, threats, timeline,
    budget, validation, lastVolley, volleyCount, pendingKind, setPendingKind,
    holderId, attackingTeam, selectedId, setSelectedId,
    addOrder, clickPlayer, clickCourt, setTargetForLast, aimLastAtPoint,
    removeOrder, clearDraft, autoPlan, lockAndResolve,
    restart: start, isOver,
    matchSeconds, matchLength: matchLengthSeconds(defaultHalfSeconds(minutesPerHalf))
  }
}


