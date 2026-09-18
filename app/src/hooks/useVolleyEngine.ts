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
import type { MatchState, TeamId } from '@engine/types.js'
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
  const seedRef = useRef(seed)
  const matchSeconds = defaultHalfSeconds(minutesPerHalf) * 2

  const start = useCallback(() => {
    const initial = createVolleyMatch(seedRef.current)
    setEngineState(initial)
    setMatch(toUIMatch(initial))
    const team = initial.teams.nangis.possession ? 'nangis' : 'lagny'
    draftCounter = 0
    setDraft(suggestOpeningDraft(initial, team))
    setSelectedId(initial.ball.holderId)
    setLastVolley(null)
    setVolleyCount(0)
  }, [])

  useEffect(() => { start() }, [start])

  const attackingTeam: TeamId = engineState ? (engineState.teams.nangis.possession ? 'nangis' : 'lagny') : 'nangis'
  const holderId = engineState?.ball.holderId ?? null

  const addOrder = useCallback((kind: AttackVolleyIntent, targetId?: string) => {
    const current = engineState
    if (!current) return
    const actorId = selectedId ?? current.ball.holderId
    const actor = current.players[actorId]
    if (!actor) return
    const order: VolleyDraftOrder = { id: `ordre-${Date.now()}-${Math.floor(Math.random() * 9999)}`, actorId, kind }
    if (kind === 'pass' || kind === 'fix') {
      if (!targetId) return
      order.targetId = targetId
    } else if (kind === 'move' || kind === 'attackSpace' || kind === 'cut' || kind === 'stretch') {
      const dir = actor.team === 'nangis' ? 1 : -1
      if (targetId && current.players[targetId]) {
        const target = current.players[targetId]
        order.targetPosition = { ...target.position }
        if (target.team === actor.team && targetId !== actorId) order.actorId = targetId
      } else {
        order.targetPosition = { x: actor.position.x + dir * 3, y: actor.position.y }
      }
    }
    setDraft((prev) => [...prev, order])
  }, [engineState, selectedId])

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
  }, [])

  const clearDraft = useCallback(() => setDraft([]), [])

  const autoPlan = useCallback(() => {
    const current = engineState
    if (!current) return
    const team: TeamId = current.teams.nangis.possession ? 'nangis' : 'lagny'
    const plan = chooseVolleyAttack(current, team)
    const mapped: VolleyDraftOrder[] = plan.orders.map((order, index) => ({ ...order, id: `ordre-ia-${index}` }))
    setDraft(mapped.length > 0 ? mapped : suggestOpeningDraft(current, team))
    setSelectedId(current.ball.holderId)
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
    if (!current || draft.length === 0) return
    const team: TeamId = current.teams.nangis.possession ? 'nangis' : 'lagny'
    const attack = team === 'nangis' ? draftToPlan(current, team, draft) : chooseVolleyAttack(current, team)
    const defense = chooseVolleyDefense(current, team)
    const { state: next, planned } = resolveVolleyTurn(current, attack, defense, seedRef.current)
    setEngineState(next)
    setMatch(toUIMatch(next))
    setLastVolley({ ...planned, defense })
    setVolleyCount((count) => count + 1)
    const nextTeam: TeamId = next.teams.nangis.possession ? 'nangis' : 'lagny'
    draftCounter = 0
    setDraft(suggestOpeningDraft(next, nextTeam))
    setSelectedId(next.ball.holderId)
  }, [engineState, draft])

  const isOver = match ? match.time >= matchSeconds : false

  return {
    engineState, match, draft, trajectories, gapMarkers, gaps,
    budget, validation, lastVolley, volleyCount,
    holderId, attackingTeam, selectedId, setSelectedId,
    addOrder, setTargetForLast, aimLastAtPoint,
    removeOrder, clearDraft, autoPlan, lockAndResolve,
    restart: start, isOver,
    matchSeconds, matchLength: matchLengthSeconds(defaultHalfSeconds(minutesPerHalf))
  }
}


