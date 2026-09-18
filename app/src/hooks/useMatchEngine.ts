import { useState, useEffect, useRef, useCallback } from 'react'
import { createPilotMatch } from '@engine/match.js'
import { chooseNextAction } from '@engine/ai.js'
import { getSituation } from '@engine/engine.js'
import { playAction, installPossession } from '@engine/possession.js'
import { changeSystem, callTimeout } from '@engine/coaching.js'
import { SeededRandom } from '@engine/random.js'
import type { ActionIntent, DefensiveSystem, MatchState, TeamId } from '@engine/types.js'

export type ControlMode = 'coach' | 'auto'

interface UIPlayer {
  id: string
  name: string
  number: number
  team: 'nangis' | 'lagny'
  position: { x: number; y: number }
  role?: string
  hasBall?: boolean
  fatigue?: number
  pressure?: number
}

interface UIMatchState {
  players: UIPlayer[]
  ball: { position: { x: number; y: number } }
  score: { nangis: number; lagny: number }
  time: number
  period: 1 | 2
  possession: 'nangis' | 'lagny'
  systems: { nangis: DefensiveSystem; lagny: DefensiveSystem }
  timeouts: number
}

interface Action {
  id: string
  name: string
  description: string
  risk?: 'safe' | 'moderate' | 'risky'
  enabled: boolean
  intent: ActionIntent
}

// Seed par defaut : la partie est rejouable a l identique. La seed affichee
// dans le HUD suffit a reproduire exactement le meme match.
const DEFAULT_SEED = 44512

const POSSESSION_LIMIT = 60
const TIME_LIMIT = 3600

const playerNumbers: Record<string, number> = {
  pierre: 11, erwan: 9, yanis: 7, aaron: 8, elian: 13, edgar: 6, liam: 1,
  leo: 10, ilyes: 12,
  malone: 17, mael: 15, kael: 14, elio: 16, neo: 19, karim: 18, teddy: 1,
  layo: 20, rio: 21
}

const roleLabels: Record<string, string> = {
  goalkeeper: 'Gardien',
  wing: 'Ailier',
  back: 'Arrière',
  center: 'Demi-centre',
  pivot: 'Pivot'
}

export default function useMatchEngine() {
  const [engineState, setEngineState] = useState<MatchState | null>(null)
  const [matchState, setMatchState] = useState<UIMatchState | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<UIPlayer | null>(null)
  const [availableActions, setAvailableActions] = useState<Action[]>([])
  const [speed, setSpeed] = useState(2)
  const [awaitingDecision, setAwaitingDecision] = useState(false)
  const [decisionLabel, setDecisionLabel] = useState<string | null>(null)
  const [controlMode, setControlMode] = useState<ControlMode>('coach')
  const [isMatchOver, setIsMatchOver] = useState(false)
  const [seed, setSeed] = useState(DEFAULT_SEED)

  const engineRef = useRef<MatchState | null>(null)
  const controlModeRef = useRef<ControlMode>('coach')
  const awaitingDecisionRef = useRef(false)
  const actionCountRef = useRef(0)
  const possessionCountRef = useRef(0)
  const lastAttackingTeamRef = useRef<TeamId>('nangis')
  const stallRef = useRef(0)
  const actionsRef = useRef<Action[]>([])

  const syncState = useCallback((next: MatchState) => {
    engineRef.current = next
    setEngineState(next)

    const players: UIPlayer[] = Object.values(next.players)
      .filter((p) => p.isOnCourt)
      .map((p) => ({
        id: p.id,
        name: p.name,
        number: playerNumbers[p.id] ?? 99,
        team: p.team,
        position: p.position,
        role: roleLabels[p.role],
        hasBall: next.ball.holderId === p.id,
        fatigue: Math.round(p.energy),
        pressure: Math.round(p.pressure)
      }))

    setMatchState({
      players,
      ball: { position: next.ball.position },
      score: { nangis: next.teams.nangis.score, lagny: next.teams.lagny.score },
      time: next.timeSeconds,
      period: next.period,
      possession: next.teams.nangis.possession ? 'nangis' : 'lagny',
      systems: { nangis: next.teams.nangis.system, lagny: next.teams.lagny.system },
      timeouts: next.teams.nangis.timeouts
    })
  }, [])

  const checkMatchEnd = useCallback((state: MatchState) => {
    if (possessionCountRef.current >= POSSESSION_LIMIT || state.timeSeconds >= TIME_LIMIT) {
      setIsMatchOver(true)
      setIsPaused(true)
      setAwaitingDecision(false)
      awaitingDecisionRef.current = false
      setDecisionLabel(null)
    }
  }, [])

// --- partie 2 : decisions ---

// Libelle lisible d une action, sans jamais exposer les rouages du moteur.
function describeAction(intent: ActionIntent, state: MatchState, playerId: string): Action | null {
  const actor = state.players[actorId(intent)] ?? state.players[playerId]
  if (!actor) return null
  const target = intent.targetId ? state.players[intent.targetId] : null
  const enabled = intent.actorId === undefined || intent.actorId === playerId

  const base = { id: intentKey(intent), enabled, intent }

  switch (intent.type) {
    case 'pass': {
      const pressured = (state.players[intent.actorId ?? '']?.pressure ?? 0) > 55
      return {
        ...base,
        name: `Passe à ${target?.name ?? '?'}`,
        description: pressured ? 'Passe sous pression, à doser' : 'Passe vers un coéquipier ouvert',
        risk: pressured ? 'risky' : 'moderate'
      }
    }
    case 'duel':
      return {
        ...base,
        name: `Duel face à ${target?.name ?? '?'}`,
        description: 'Jouer son un-contre-un',
        risk: 'risky'
      }
    case 'fix':
      return {
        ...base,
        name: `Fixer ${target?.name ?? '?'}`,
        description: 'Attirer le défenseur pour ouvrir un espace',
        risk: 'safe'
      }
    case 'cross':
      return {
        ...base,
        name: `Croiser avec ${target?.name ?? '?'}`,
        description: 'Échange de position pour décaler',
        risk: 'moderate'
      }
    case 'run':
      return {
        ...base,
        name: 'Course de décrochage',
        description: 'Se démarquer vers l\'espace libre',
        risk: 'safe'
      }
    case 'shoot':
      return {
        ...base,
        name: 'Tir',
        description: 'Tenter sa chance au but',
        risk: 'risky'
      }
    default:
      return null
  }
}

function actorId(intent: ActionIntent): string {
  return (intent as { actorId?: string }).actorId ?? ''
}

function intentKey(intent: ActionIntent): string {
  return `${intent.type}-${(intent as { targetId?: string }).targetId ?? '-'}`
}

// Tirs parametres : le moteur porte deja le contrat shotType / shotSide /
// shotHeight. L interface ne fait que le presenter.
function buildShotOptions(playerId: string): Action[] {
  const variants: Array<{ name: string; description: string; risk: Action['risk']; shot: Pick<ActionIntent, 'shotType' | 'shotSide' | 'shotHeight'> }> = [
    { name: 'Tir en appui', description: 'Côté proche, bas, à froid', risk: 'safe', shot: { shotType: 'placed', shotSide: 'near', shotHeight: 'low' } },
    { name: 'Frappe centre', description: 'Plein axe, milieu de hauteur', risk: 'moderate', shot: { shotType: 'power', shotSide: 'center', shotHeight: 'middle' } },
    { name: 'Frappe opposée haute', description: 'Côté lointain, en hauteur', risk: 'moderate', shot: { shotType: 'power', shotSide: 'far', shotHeight: 'high' } },
    { name: 'Lob', description: 'Par-dessus le gardien sorti', risk: 'risky', shot: { shotType: 'lob', shotSide: 'near', shotHeight: 'high' } },
    { name: 'Roucoulette', description: 'Sous le bras, près du poteau', risk: 'risky', shot: { shotType: 'roucoulette', shotSide: 'near', shotHeight: 'low' } }
  ]
  return variants.map((variant) => ({
    id: `shot-${variant.shot.shotType}-${variant.shot.shotSide}-${variant.shot.shotHeight}`,
    name: variant.name,
    description: variant.description,
    risk: variant.risk,
    enabled: true,
    intent: {
      type: 'shoot',
      actorId: playerId,
      ...variant.shot
    } as ActionIntent
  }))
}

// Actions proposees dans la fenetre de decision Nangis : celles du moteur,
// dont les passes vers les coequipiers, plus les tirs parametres si dispo.
const refreshActions = useCallback((state: MatchState) => {
  const holder = state.players[state.ball.holderId]
  if (!holder || holder.team !== 'nangis') {
    setAvailableActions([])
    return
  }
  const situation = getSituation(state)
  const fromEngine = situation.availableActions
    .map((intent) => describeAction(intent, state, holder.id))
    .filter((action): action is Action => action !== null)
  const unique = new Map<string, Action>()
  fromEngine.forEach((action) => {
    if (!unique.has(action.id)) unique.set(action.id, action)
  })
  if (situation.availableActions.some((action) => action.type === 'shoot')) {
    buildShotOptions(holder.id).forEach((shot) => unique.set(shot.id, shot))
  }
  const list = Array.from(unique.values())
  setAvailableActions(list)
  actionsRef.current = list
}, [])

// Jouer une action du porteur Nangis via le moteur, jamais recodee.
const performAction = useCallback((action: Action) => {
  const current = engineRef.current
  if (!current) return
  setAwaitingDecision(false)
  awaitingDecisionRef.current = false
  setDecisionLabel(null)
  actionCountRef.current += 1

  const random = new SeededRandom(current.seed + current.events.length)
  const played = playAction(current, action.intent, random)
  syncState(played.state)
  checkMatchEnd(played.state)
}, [checkMatchEnd, syncState])

// Fenetre de decision : le porteur Nangis dispose des actions du moteur.
const openDecisionWindow = useCallback((state: MatchState) => {
  const holder = state.players[state.ball.holderId]
  if (!holder || holder.team !== 'nangis') return false
  setAwaitingDecision(true)
  awaitingDecisionRef.current = true
  setDecisionLabel(`${holder.name} a la balle — à toi de jouer`)
  refreshActions(state)
  return true
}, [refreshActions])

// Demander a l IA de trancher pour Nangis dans la fenetre ouverte.
const letAiDecide = useCallback(() => {
  const current = engineRef.current
  if (!current || !awaitingDecisionRef.current) return
  const random = new SeededRandom(current.seed + current.events.length + 77)
  const trace = chooseNextAction(current, 'nangis', random, actionCountRef.current)
  setAwaitingDecision(false)
  awaitingDecisionRef.current = false
  setDecisionLabel(null)
  if (!trace) return
  actionCountRef.current += 1
  const played = playAction(current, trace.action, random)
  syncState(played.state)
  checkMatchEnd(played.state)
}, [checkMatchEnd, syncState])
// --- partie 3 : boucle de simulation ---

function opposing(team: TeamId): TeamId {
  return team === 'nangis' ? 'lagny' : 'nangis'
}

// Filet de securite : si l IA n aboutit pas, on prend la premiere action
// proposée par le moteur pour le porteur. Jamais de decision recodee ici.
function fallbackAction(state: MatchState): ActionIntent | undefined {
  const situation = getSituation(state)
  return situation.availableActions.find((intent) => intent.actorId === state.ball.holderId)
}

const startMatch = useCallback(() => {
  const initial = createPilotMatch(DEFAULT_SEED)
  actionCountRef.current = 0
  possessionCountRef.current = 0
  stallRef.current = 0
  lastAttackingTeamRef.current = 'nangis'
  setIsPaused(false)
  setIsMatchOver(false)
  syncState(initial)
}, [syncState])

// Demarrage unique : la seed est fixe, la partie est rejouable a l identique.
useEffect(() => {
  startMatch()
}, [startMatch])

const restartMatch = useCallback(() => {
  setAwaitingDecision(false)
  awaitingDecisionRef.current = false
  setDecisionLabel(null)
  setSelectedPlayer(null)
  setAvailableActions([])
  actionsRef.current = []
  startMatch()
}, [startMatch])

const togglePause = useCallback(() => {
  if (awaitingDecisionRef.current) return
  setIsPaused((paused) => !paused)
}, [])

const selectPlayer = useCallback((playerId: string) => {
  const player = matchState?.players.find((p) => p.id === playerId)
  if (player) setSelectedPlayer(player)
}, [matchState])

const executeAction = useCallback((actionId: string) => {
  const action = actionsRef.current.find((candidate) => candidate.id === actionId)
  if (action) performAction(action)
}, [performAction])

const setSystem = useCallback((system: DefensiveSystem) => {
  const current = engineRef.current
  if (!current) return
  syncState(changeSystem(current, 'nangis', system))
}, [syncState])

const takeTimeout = useCallback(() => {
  const current = engineRef.current
  if (!current) return
  try {
    syncState(callTimeout(current, 'nangis'))
  } catch {
    // Pas de temps mort disponible : on ignore silencieusement.
  }
}, [syncState])

// Boucle pilotee par l etat : entre deux rendus, soit la fenetre de decision
// s ouvre pour Nangis en mode coach, soit un pas de simulation IA s execute.
useEffect(() => {
  if (isPaused || isMatchOver || awaitingDecision) return
  const state = engineRef.current
  if (!state) return

  if (controlMode === 'coach' && state.teams.nangis.possession) {
    const holder = state.players[state.ball.holderId]
    if (holder?.team === 'nangis') {
      openDecisionWindow(state)
      return
    }
  }

  const timer = setTimeout(() => {
    const current = engineRef.current
    if (!current) return
    const holder = current.players[current.ball.holderId]
    if (!holder) return
    const random = new SeededRandom(current.seed + current.events.length * 31 + actionCountRef.current)
    const trace = chooseNextAction(current, holder.team, random, actionCountRef.current)
    const intent = trace?.action ?? fallbackAction(current)
    if (!intent) {
      stallRef.current += 1
      if (stallRef.current > 6) {
        stallRef.current = 0
        syncState(installPossession(current, opposing(holder.team), 'interception'))
      }
      return
    }
    actionCountRef.current += 1
    stallRef.current = 0
    const played = playAction(current, intent, random)
    if (played.possessionChanged) {
      possessionCountRef.current += 1
      lastAttackingTeamRef.current = opposing(holder.team)
    }
    syncState(played.state)
    checkMatchEnd(played.state)
  }, 850 / speed)

  return () => clearTimeout(timer)
}, [isPaused, isMatchOver, awaitingDecision, controlMode, speed, matchState, openDecisionWindow, syncState, checkMatchEnd])

return {
  matchState,
  engineState,
  isPaused,
  togglePause,
  selectedPlayer,
  selectPlayer,
  availableActions,
  executeAction,
  speed,
  setSpeed,
  controlMode,
  setControlMode,
  awaitingDecision,
  decisionLabel,
  letAiDecide,
  setSystem,
  takeTimeout,
  isMatchOver,
  restartMatch,
  seed
}
}