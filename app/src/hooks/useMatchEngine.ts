import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createPilotMatch } from '@engine/match.js'
import { chooseNextAction } from '@engine/ai.js'
import { contestAction, defensiveIntents, getSituation, shotProfile } from '@engine/engine.js'
import { playAction, installPossession } from '@engine/possession.js'
import { changeSystem, callTimeout } from '@engine/coaching.js'
import { SeededRandom } from '@engine/random.js'
import { shotContext } from '@engine/court.js'
import type { ActionIntent, DefensiveSystem, MatchState, TeamId } from '@engine/types.js'
import type { TacticalTrajectory } from '../utils/fieldRenderer'
import type { ClimaxEvent } from '../components/ActionClimaxOverlay'
import type { DuelContext } from '../components/SideTacticalPanel'

export type ControlMode = 'coach' | 'auto'

export interface ActionFeedback {
  title: string
  detail: string
  success: boolean
  type: string
}

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

export type ActionQuality = 'very-favorable' | 'favorable' | 'neutral' | 'risky' | 'very-risky'

export interface Action {
  id: string
  name: string
  description: string
  risk?: 'safe' | 'moderate' | 'risky'
  quality: ActionQuality
  qualityLabel: string
  estimatedSuccess: number
  enabled: boolean
  intent: ActionIntent
}

export interface LiveMatchStats {
  score: { nangis: number; lagny: number }
  possessions: { nangis: number; lagny: number }
  shots: { nangis: number; lagny: number }
  saves: { nangis: number; lagny: number }
  turnovers: { nangis: number; lagny: number }
  fouls: { nangis: number; lagny: number }
  shotEfficiency: { nangis: number; lagny: number }
  keyObservations: string[]
}

export interface PendingContest {
  action: Action
  defenderId: string
  defenderName: string
  options: Array<{ key: NonNullable<ActionIntent['contestAction']>; label: string; detail: string }>
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

const CAUSE_TRANSLATIONS: Record<string, string> = {
  'passing quality': 'qualité de passe',
  'reception timing': 'réception propre',
  'available lane': 'intervalle ouvert',
  'lane contested but released': 'intervalle contesté forcé',
  'defensive lane closure': 'intervalle fermé',
  'pressure': 'sous pression',
  'distance': 'distance excessive',
  'defensive reading': 'lecture défensive',
  'first step': 'premier pas explosif',
  'acceleration': 'vitesse d\'appuis',
  'space': 'espace attaqué',
  'contact': 'faute au contact',
  'late defensive timing': 'retard défensif',
  'defensive anticipation': 'anticipation défensive',
  'help coverage': 'couverture d\'aide',
  'fatigue': 'fatigue',
  'carrier threat': 'fixation du porteur',
  'defender choice': 'défenseur aspiré',
  'space created elsewhere': 'espace libéré à l\'opposé',
  'shot quality': 'précision du tir',
  'angle': 'angle ouvert',
  'timing': 'timing',
  'goalkeeper reading': 'lecture du gardien',
  'shot distance': 'tir de trop loin',
  'carrier advance': 'avance ballon en main',
  'run-up built': 'élan pris',
  'shooting balance': 'appuis calés',
  'run-up momentum': 'tir en appui porté par l\'élan',
  'defensive priority': 'priorité défensive',
  'persistent assignment': 'marquage strict persistant',
  'line denial': 'ligne de passe barrée',
  'cover teammate': 'couverture du coéquipier',
  'close interval': 'intervalle fermé',
  'space abandoned elsewhere': 'espace abandonné ailleurs'
}

function translateCauses(causes: string[]): string {
  return (causes || []).map((c) => CAUSE_TRANSLATIONS[c] || c).join(' · ')
}

function formatCausalFeedback(
  event: { type: string; result: string; actorId?: string; targetId?: string; causes: string[] },
  state: MatchState
): ActionFeedback {
  const actor = event.actorId ? state.players[event.actorId] : null
  const target = event.targetId ? state.players[event.targetId] : null
  const actorName = actor?.name ?? 'Le joueur'
  const targetName = target?.name ?? 'l\'adversaire'
  const detail = translateCauses(event.causes || [])

  if (event.type === 'pass') {
    if (event.result === 'complete') {
      return {
        title: `Passe réussie : ${actorName} ➔ ${targetName}`,
        detail: detail || 'Passe assurée dans l\'intervalle',
        success: true,
        type: 'pass'
      }
    }
    return {
      title: `Passe interceptée ! (${actorName} vers ${targetName})`,
      detail: detail || 'Interception adverse',
      success: false,
      type: 'pass'
    }
  }

  if (event.type === 'duel') {
    if (event.result === 'won') {
      return {
        title: `Duel gagné : ${actorName} déborde ${targetName}`,
        detail: detail || 'Premier pas décisif',
        success: true,
        type: 'duel'
      }
    }
    if (event.result === 'foul-defense') {
      return {
        title: `Faute défensive de ${targetName} sur ${actorName}`,
        detail: detail || 'Coup franc accordé',
        success: true,
        type: 'duel'
      }
    }
    return {
      title: `Duel contenu : ${targetName} bloque ${actorName}`,
      detail: detail || 'Défense en place',
      success: false,
      type: 'duel'
    }
  }

  if (event.type === 'shoot') {
    if (event.result === 'goal') {
      return {
        title: `BUT DE ${actorName.toUpperCase()} !`,
        detail: detail || 'Tir imparable',
        success: true,
        type: 'goal'
      }
    }
    return {
      title: `Arrêt de ${targetName ?? 'Teddy'} sur le tir de ${actorName}`,
      detail: detail || 'Tir repoussé par le gardien',
      success: false,
      type: 'save'
    }
  }

  if (event.type === 'fixation' || event.type === 'fix') {
    return {
      title: `${actorName} fixe ${targetName}`,
      detail: detail || 'Défenseur aspiré, espace créé',
      success: true,
      type: 'fix'
    }
  }

  if (event.type === 'cross') {
    return {
      title: `Croisé de ${actorName} avec ${targetName}`,
      detail: detail || 'Couloirs échangés : tirer ou passer derrière',
      success: true,
      type: 'cross'
    }
  }

  if (event.type === 'off-ball-run') {
    const isCarrier = (event.causes || []).includes('carrier advance')
    return {
      title: isCarrier ? `${actorName} avance ballon en main` : `${actorName} attaque l'espace`,
      detail: detail || (isCarrier ? 'Élan pris : le tir en appui gagne en puissance' : 'Démarquage hors du bloc'),
      success: true,
      type: 'run'
    }
  }

  if (event.type === 'dribble') {
    return {
      title: event.result === 'shifted' ? `${actorName} décale d'un dribble` : `${actorName} tenu au dribble`,
      detail: detail || (event.result === 'shifted' ? 'Changement de rythme, pression relâchée' : 'Défenseur resté équilibré'),
      success: event.result === 'shifted',
      type: 'dribble'
    }
  }

  if (event.type === 'defensive-press') {
    return {
      title: `${actorName} sort sur ${targetName}`,
      detail: detail || 'Sortie agressive : décision forcée, espace derrière',
      success: true,
      type: 'press'
    }
  }

  if (event.type === 'defensive-retreat') {
    return {
      title: `${actorName} replie le bloc`,
      detail: detail || 'Intervalle protégé, tir lointain concédé',
      success: true,
      type: 'retreat'
    }
  }

  if (event.type === 'interception') {
    return {
      title: event.result === 'stolen' ? `${actorName} coupe la ligne` : `${actorName} battu sur son anticipation`,
      detail: detail || (event.result === 'stolen' ? 'Passe lue et volée' : 'Mauvaise lecture, espace ouvert'),
      success: event.result === 'stolen',
      type: 'intercept'
    }
  }

  if (event.type === 'mark') {
    return {
      title: `${actorName} colle ${targetName}`,
      detail: detail || 'Marquage strict : la ligne de passe est barrée',
      success: true,
      type: 'mark'
    }
  }

  if (event.type === 'defensive-help') {
    return {
      title: `${actorName} vient en aide face à ${targetName}`,
      detail: detail || 'Aide posée, intervalle fermé',
      success: true,
      type: 'help'
    }
  }

  return {
    title: `${actorName} : ${event.type} (${event.result})`,
    detail,
    success: event.result !== 'intercepted' && event.result !== 'save' && event.result !== 'contained',
    type: event.type
  }
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
  const [pendingContest, setPendingContest] = useState<PendingContest | null>(null)
  const [controlMode, setControlMode] = useState<ControlMode>('coach')
  const [isMatchOver, setIsMatchOver] = useState(false)
  const [seed, setSeed] = useState(DEFAULT_SEED)
  const [feedback, setFeedback] = useState<ActionFeedback | null>(null)
  const [hoveredActionId, setHoveredActionId] = useState<string | null>(null)
  const [climax, setClimax] = useState<ClimaxEvent | null>(null)
  const [isExpertMode, setIsExpertMode] = useState(false)
  const [defensiveStance, setDefensiveStance] = useState<'disciplined' | 'press' | 'anticipate'>('disciplined')

  const engineRef = useRef<MatchState | null>(null)
  const controlModeRef = useRef<ControlMode>('coach')
  const awaitingDecisionRef = useRef(false)
  const isTransitioningRef = useRef(false)
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

    if (next.teams.lagny.possession) {
      // Phase defensive : on garde la selection si c est un defenseur Nangis,
      // pour laisser le coach organiser le marquage (doc 17, ecart E-001).
      setSelectedPlayer((selected) => {
        if (!selected) return null
        const kept = next.players[selected.id]
        return kept && kept.team === 'nangis' && kept.isOnCourt ? selected : null
      })
    }
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

  // Fenetre de contestation : quand Nangis attaque, le coach choisit d'abord la
  // reponse du defenseur le plus proche (doc 00 : gardien ou bloc au bon moment),
  // puis l'action se resout. Sans choix, l'automate conteste via contestAction.
  function buildContest(action: Action, state: MatchState): PendingContest | null {
  const intent = action.intent
  if (intent.type !== 'duel' && intent.type !== 'dribble' && intent.type !== 'shoot' && intent.type !== 'pass') return null
  if (intent.contestedBy) return null
  const auto = contestAction(state, intent)
  if (!auto.contestedBy || !auto.contestAction) return null
  const defender = state.players[auto.contestedBy]
  if (!defender || defender.team !== 'lagny') return null
  const base: Array<{ key: NonNullable<ActionIntent['contestAction']>; label: string; detail: string }> =
    intent.type === 'shoot'
      ? [
        { key: 'block-shot', label: 'Bloquer le tir', detail: 'Monter au bon moment' },
        { key: 'press', label: 'Sortir fort', detail: 'Presser le tireur' },
        { key: 'retreat', label: 'Rester en bloc', detail: 'Conceder le tir lointain' },
        { key: 'none', label: 'Laisser tirer', detail: 'Faire confiance au gardien' }
      ]
      : intent.type === 'pass'
        ? [
          { key: 'intercept', label: 'Couper la ligne', detail: 'Vol ou elimination' },
          { key: 'contain', label: 'Contenir', detail: 'Rester entre et ballon' },
          { key: 'none', label: 'Laisser passer', detail: 'Garder la structure' }
        ]
        : [
          { key: 'press', label: 'Sortir fort', detail: 'Defense dure' },
          { key: 'contain', label: 'Contenir', detail: 'Rester place' },
          { key: 'help', label: 'Aider', detail: 'Doubler, ouvrir ailleurs' },
          { key: 'retreat', label: 'Reculer', detail: 'Proteger l intervalle' },
          { key: 'none', label: 'Laisser jouer', detail: 'Compter sur le placement' }
        ]
  return { action, defenderId: defender.id, defenderName: defender.name, options: base }
}

// --- partie 2 : decisions ---

function computeEstimatedSuccess(intent: ActionIntent, state: MatchState): number {
  const actor = state.players[intent.actorId]
  if (!actor) return 50

  if (intent.type === 'pass') {
    const target = intent.targetId ? state.players[intent.targetId] : null
    if (!target) return 50
    const pressure = Math.max(0, actor.pressure - 30)
    const opposingTeam = actor.team === 'nangis' ? 'lagny' : 'nangis'
    const defSys = state.teams[opposingTeam]?.system ?? '6-0'
    const defPressureVal = defSys === '1-5' && actor.role === 'center' ? 18 : 8
    const dist = Math.hypot(actor.position.x - target.position.x, actor.position.y - target.position.y)
    const prob = (actor.passing + target.reception - pressure - defPressureVal - dist * 2) / 160
    return Math.max(12, Math.min(95, Math.round(prob * 100)))
  }

  if (intent.type === 'duel') {
    const target = intent.targetId ? state.players[intent.targetId] : null
    if (!target) return 50
    const contest = intent.contestedBy === target.id
      ? intent.contestAction === 'press' ? -14
      : intent.contestAction === 'help' ? -18
      : intent.contestAction === 'retreat' ? 10 : 0
      : 0
    const beaten = (target.beatenUntil ?? 0) > state.timeSeconds ? 25 : 0
    const adv = actor.duel + actor.acceleration + actor.confidence / 2 - target.defense - target.anticipation / 2 + contest + beaten
    const prob = (adv + 100) / 200
    return Math.max(15, Math.min(92, Math.round(prob * 100)))
  }

  if (intent.type === 'dribble') {
    const target = intent.targetId ? state.players[intent.targetId] : null
    if (!target) return 50
    const adv = actor.duel * 0.6 + actor.acceleration * 0.8 + actor.confidence / 3 - target.defense * 0.7 - target.anticipation / 3
    const prob = (adv + 100) / 200
    return Math.max(20, Math.min(90, Math.round(prob * 100)))
  }

  if (intent.type === 'shoot') {
    const context = shotContext(actor.position, actor.team)
    const profile = shotProfile(intent.shotType ?? (actor.role === 'wing' ? 'extension' : actor.role === 'back' ? 'jump' : 'placed'))
    const roleBonus = actor.role === 'wing' ? profile.wingBonus : actor.role === 'back' ? profile.backBonus : actor.role === 'pivot' ? profile.pivotBonus : 1
    const momentum = actor.momentum ?? 0
    const momentumBonus = momentum * (intent.shotType === 'placed' ? 0.12 : 0.06)
    const shootingPower = actor.shooting + profile.power + roleBonus - context.effectiveDistance * 0.7 - actor.pressure * 0.3 + momentumBonus
    const opposingTeam = actor.team === 'nangis' ? 'lagny' : 'nangis'
    const gk = Object.values(state.players).find((p) => p.team === opposingTeam && p.role === 'goalkeeper')
    const savePower = gk ? gk.goalkeeper + gk.anticipation * 0.35 : 60
    const prob = (shootingPower - savePower + 100) / 200
    return Math.max(18, Math.min(90, Math.round(prob * 100)))
  }

  if (intent.type === 'mark' || intent.type === 'help' || intent.type === 'press' || intent.type === 'retreat' || intent.type === 'intercept') {
    return 85
  }

  if (intent.type === 'fix') {
    return 84
  }

  if (intent.type === 'cross' || intent.type === 'run') {
    return 78
  }

  return 60
}

function qualityFromPercentage(pct: number): { quality: ActionQuality; label: string; risk: 'safe' | 'moderate' | 'risky' } {
  if (pct >= 75) return { quality: 'very-favorable', label: 'Très favorable', risk: 'safe' }
  if (pct >= 60) return { quality: 'favorable', label: 'Favorable', risk: 'safe' }
  if (pct >= 45) return { quality: 'neutral', label: 'Neutre', risk: 'moderate' }
  if (pct >= 30) return { quality: 'risky', label: 'Risqué', risk: 'risky' }
  return { quality: 'very-risky', label: 'Très risqué', risk: 'risky' }
}

// Libelle lisible d une action, sans jamais exposer les rouages du moteur.
function describeAction(intent: ActionIntent, state: MatchState, playerId: string): Action | null {
  const actor = state.players[actorId(intent)] ?? state.players[playerId]
  if (!actor) return null
  const target = intent.targetId ? state.players[intent.targetId] : null
  const enabled = intent.actorId === undefined || intent.actorId === playerId
  const estimated = computeEstimatedSuccess(intent, state)
  const tier = qualityFromPercentage(estimated)

  const base = {
    id: intentKey(intent),
    enabled,
    intent,
    estimatedSuccess: estimated,
    quality: tier.quality,
    qualityLabel: tier.label,
    risk: tier.risk
  }

  switch (intent.type) {
    case 'pass': {
      const pressured = (state.players[intent.actorId ?? '']?.pressure ?? 0) > 55
      return {
        ...base,
        name: `Passe à ${target?.name ?? '?'}`,
        description: pressured ? 'Passe sous pression, à doser' : 'Passe vers un coéquipier démarqué'
      }
    }
    case 'duel':
      return {
        ...base,
        name: `Duel face à ${target?.name ?? '?'}`,
        description: intent.contestedBy ? `Un-contre-un contesté (${intent.contestAction ?? 'contenu'})` : 'Prendre l\'intervalle en un-contre-un'
      }
    case 'dribble':
      return {
        ...base,
        name: `Dribble face à ${target?.name ?? '?'}`,
        description: 'Changement de rythme : décaler sans s\'engager'
      }
    case 'fix':
      return {
        ...base,
        name: `Fixer ${target?.name ?? '?'}`,
        description: 'Attirer le défenseur pour ouvrir l\'espace'
      }
    case 'cross':
      return {
        ...base,
        name: `Croiser avec ${target?.name ?? '?'}`,
        description: 'Échanger les couloirs : tirer ou passer derrière'
      }
    case 'run': {
      if (intent.runKind === 'advance') {
        return { ...base, name: 'Avancer ballon en main', description: 'Prendre de l\'élan pour un tir en appui' }
      }
      if (intent.runKind === 'diagonal') {
        return { ...base, name: 'Diagonale intérieure', description: 'Attaquer l\'axe, ballon en main' }
      }
      if (intent.runKind === 'lateral') {
        return { ...base, name: 'Décalage extérieur', description: 'Ouvrir l\'angle de tir vers l\'aile' }
      }
      return { ...base, name: 'Course de démarquage', description: 'Attaquer l\'espace libre derrière la défense' }
    }
    case 'mark':
      return {
        ...base,
        name: `Marquer ${target?.name ?? '?'}`,
        description: 'Marquage strict : coller, barrer la ligne de passe'
      }
    case 'help':
      return {
        ...base,
        name: `Aider sur ${target?.name ?? '?'}`,
        description: 'Doubler le porteur, fermer l\'intervalle central'
      }
    case 'press':
      return {
        ...base,
        name: `Sortir sur ${target?.name ?? '?'}`,
        description: 'Monter agressif : forcer la décision, ouvrir derrière'
      }
    case 'retreat':
      return {
        ...base,
        name: 'Repli du bloc',
        description: 'Reculer : protéger l\'intervalle, concéder le loin'
      }
    case 'intercept':
      return {
        ...base,
        name: `Couper la ligne de ${target?.name ?? '?'}`,
        description: 'Anticiper la passe : vol ou élimination'
      }
    case 'shoot': {
      const momentum = (state.players[intent.actorId ?? '']?.momentum ?? 0)
      const label = intent.shotType === 'jump' ? 'Suspension' : intent.shotType === 'standing' ? 'Appui' : intent.shotType === 'extension' ? 'Extension' : intent.shotType === 'lob' ? 'Lob' : intent.shotType === 'roucoulette' ? 'Roucoulette' : intent.shotType === 'chabala' ? 'Chabala' : 'Tir'
      return {
        ...base,
        name: label,
        description: momentum >= 30 ? `${label} : l\'élan est pris` : `${label} : à froid`
      }
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
function buildShotOptions(playerId: string, state: MatchState): Action[] {
  const actor = state.players[playerId]
  const role = actor?.role ?? 'back'
  const context = actor ? shotContext(actor.position, actor.team) : { effectiveDistance: 99 }
  const far = context.effectiveDistance > 10
  const variants: Array<{
    name: string
    description: string
    bonus: number
    shot: Pick<ActionIntent, 'shotType' | 'shotSide' | 'shotHeight'>
  }> = role === 'wing'
    ? [
      { name: 'Extension', description: 'Ouvrir l’angle fermé — geste des ailiers', bonus: 6, shot: { shotType: 'extension', shotSide: 'far', shotHeight: 'low' } },
      { name: 'Roucoulette', description: 'Contourner le gardien — geste Malone', bonus: 2, shot: { shotType: 'roucoulette', shotSide: 'near', shotHeight: 'low' } },
      { name: 'Lob', description: 'Par-dessus le gardien avancé', bonus: -2, shot: { shotType: 'lob', shotSide: 'near', shotHeight: 'high' } },
      { name: 'Chabala', description: 'Sous le bras du gardien', bonus: 0, shot: { shotType: 'chabala', shotSide: 'near', shotHeight: 'low' } }
    ]
    : role === 'pivot'
      ? [
        { name: 'Placé', description: 'À bout portant, à l’opposé', bonus: 6, shot: { shotType: 'placed', shotSide: 'far', shotHeight: 'low' } },
        { name: 'Chabala', description: 'Sous le bras, au contact', bonus: 3, shot: { shotType: 'chabala', shotSide: 'near', shotHeight: 'low' } },
        { name: 'Lob', description: 'Au-dessus du gardien collé', bonus: 1, shot: { shotType: 'lob', shotSide: 'center', shotHeight: 'high' } },
        { name: 'Puissance', description: 'Enchaîner au contact', bonus: 2, shot: { shotType: 'power', shotSide: 'center', shotHeight: 'middle' } }
      ]
      : far
        ? [
          { name: 'Suspension', description: 'S’élever au-dessus du bloc — geste des arrières', bonus: 6, shot: { shotType: 'jump', shotSide: 'far', shotHeight: 'high' } },
          { name: 'Appui lancé', description: 'Puissance après élan — geste Erwan', bonus: 4, shot: { shotType: 'standing', shotSide: 'center', shotHeight: 'middle' } },
          { name: 'Placé', description: 'Précision à l’opposé', bonus: 1, shot: { shotType: 'placed', shotSide: 'far', shotHeight: 'low' } },
          { name: 'Puissance', description: 'Frappe lourde plein axe', bonus: 2, shot: { shotType: 'power', shotSide: 'center', shotHeight: 'high' } }
        ]
        : [
          { name: 'Appui', description: 'À mi-distance, porté par l’élan', bonus: 5, shot: { shotType: 'standing', shotSide: 'near', shotHeight: 'low' } },
          { name: 'Suspension', description: 'Au-dessus du bloc rapproché', bonus: 3, shot: { shotType: 'jump', shotSide: 'center', shotHeight: 'middle' } },
          { name: 'Placé', description: 'À l’opposé du gardien', bonus: 2, shot: { shotType: 'placed', shotSide: 'far', shotHeight: 'low' } },
          { name: 'Chabala', description: 'Feinte sous le bras', bonus: 0, shot: { shotType: 'chabala', shotSide: 'near', shotHeight: 'low' } }
        ]
  return variants.map((variant) => {
    const intent = { type: 'shoot', actorId: playerId, ...variant.shot } as ActionIntent
    const est = computeEstimatedSuccess(intent, state)
    const tier = qualityFromPercentage(est)
    return {
      id: `shot-${variant.shot.shotType}-${variant.shot.shotSide}-${variant.shot.shotHeight}`,
      name: variant.name,
      description: (state.players[playerId]?.momentum ?? 0) >= 30
        ? `${variant.description} · élan pris`
        : `${variant.description} · à froid`,
      risk: tier.risk,
      quality: tier.quality,
      qualityLabel: tier.label,
      estimatedSuccess: est,
      enabled: true,
      intent: {
        type: 'shoot',
        actorId: playerId,
        ...variant.shot
      } as ActionIntent
    }
  })
}

// Actions proposees dans la fenetre de decision Nangis : celles du moteur,
// dont les passes vers les coequipiers, plus les tirs parametres si dispo.
const refreshActions = useCallback((state: MatchState, focusId?: string | null) => {
  const holder = state.players[state.ball.holderId]
  if (holder && holder.team === 'nangis') {
    const situation = getSituation(state)
    const fromEngine = situation.availableActions
      .map((intent) => describeAction(intent, state, holder.id))
      .filter((action): action is Action => action !== null)
    const unique = new Map<string, Action>()
    fromEngine.forEach((action) => {
      if (!unique.has(action.id)) unique.set(action.id, action)
    })
    if (situation.availableActions.some((action) => action.type === 'shoot')) {
      buildShotOptions(holder.id, state).forEach((shot) => unique.set(shot.id, shot))
    }
    const list = Array.from(unique.values())
    setAvailableActions(list)
    actionsRef.current = list
    return
  }
  // Phase defensive (doc 17, ecart E-001) : le moteur fournit les intents de
  // marquage strict et d aide. L interface ne recode aucune decision.
  const focus = focusId ? state.players[focusId] : null
  const usable = focus && focus.team === 'nangis' && focus.isOnCourt && focus.role !== 'goalkeeper' ? focus : null
  if (!usable) {
    setAvailableActions([])
    actionsRef.current = []
    return
  }
  const list = defensiveIntents(state, 'nangis', usable.id)
    .map((intent) => describeAction(intent, state, usable.id))
    .filter((action): action is Action => action !== null)
  setAvailableActions(list)
  actionsRef.current = list
}, [])

  // Traitement dramatique d'une action jouée (temporisation du but, de l'arrêt, du duel)
  const handlePlayedActionWithDrama = useCallback(
    (current: MatchState, played: ReturnType<typeof playAction>) => {
      const event = played.event
      const actor = event.actorId ? current.players[event.actorId] : null
      const actorName = actor?.name ?? 'Le joueur'
      const actorNum = actor ? playerNumbers[actor.id] : undefined
      const target = event.targetId ? current.players[event.targetId] : null
      const targetName = target?.name ?? 'l\'adversaire'
      const causesText = translateCauses(event.causes)

      setFeedback(formatCausalFeedback(event, played.state))

      if (event.type === 'shoot') {
        isTransitioningRef.current = true
        if (event.result === 'goal') {
          const teamLabel = actor?.team === 'nangis' ? 'Nangis' : 'Lagny'
          setClimax({
            type: 'goal',
            actorName: `${actorName} (${teamLabel})`,
            actorNumber: actorNum,
            score: { nangis: played.state.teams.nangis.score, lagny: played.state.teams.lagny.score },
            causesText: causesText || 'Frappe puissante au fond des filets'
          })
          setTimeout(() => {
            setClimax(null)
            isTransitioningRef.current = false
            if (played.possessionChanged) {
              actionCountRef.current = 0
            }
            syncState(played.state)
            checkMatchEnd(played.state)
          }, 1700)
          return
        } else {
          const keeperName = target?.name || (actor?.team === 'nangis' ? 'Teddy' : 'Liam')
          setClimax({
            type: 'save',
            actorName,
            targetName: keeperName,
            causesText: causesText || 'Parade réflexe du gardien'
          })
          setTimeout(() => {
            setClimax(null)
            isTransitioningRef.current = false
            if (played.possessionChanged) {
              actionCountRef.current = 0
            }
            syncState(played.state)
            checkMatchEnd(played.state)
          }, 1400)
          return
        }
      }

      if (event.type === 'duel') {
        if (event.result === 'won') {
          isTransitioningRef.current = true
          setClimax({
            type: 'duel-won',
            actorName,
            targetName,
            causesText: causesText || 'Premier appui explosif'
          })
          setTimeout(() => {
            setClimax(null)
            isTransitioningRef.current = false
            syncState(played.state)
            checkMatchEnd(played.state)
          }, 1000)
          return
        } else if (event.result === 'foul-defense') {
          isTransitioningRef.current = true
          setClimax({
            type: 'foul',
            actorName,
            targetName,
            causesText: causesText || 'Faute au contact'
          })
          setTimeout(() => {
            setClimax(null)
            isTransitioningRef.current = false
            syncState(played.state)
            checkMatchEnd(played.state)
          }, 1000)
          return
        }
      }

      if (event.type === 'pass' && event.result === 'intercepted') {
        isTransitioningRef.current = true
        setClimax({
          type: 'interception',
          actorName,
          targetName,
          causesText: causesText || 'Ligne coupée par la défense'
        })
        setTimeout(() => {
          setClimax(null)
          isTransitioningRef.current = false
          if (played.possessionChanged) {
            actionCountRef.current = 0
          }
          syncState(played.state)
          checkMatchEnd(played.state)
        }, 1300)
        return
      }

      if (played.possessionChanged) {
        actionCountRef.current = 0
      }
      syncState(played.state)
      checkMatchEnd(played.state)
    },
    [checkMatchEnd, syncState]
  )

  // Jouer une action du porteur Nangis via le moteur, jamais recodee.
  const performAction = useCallback((action: Action) => {
    const current = engineRef.current
    if (!current) return
    // Attaque Nangis contestable : le coach choisit d'abord la reponse du
    // defenseur, puis ca se resout (mandat pilote-sim, doc 00).
    const contest = buildContest(action, current)
    if (contest) {
      setPendingContest(contest)
      setAwaitingDecision(true)
      awaitingDecisionRef.current = true
      setDecisionLabel(`${contest.defenderName} peut repondre — choisis la defense avant ${action.name}`)
      return
    }
    setPendingContest(null)
    setAwaitingDecision(false)
    awaitingDecisionRef.current = false
    setDecisionLabel(null)
    actionCountRef.current += 1

    const random = new SeededRandom(current.seed + current.events.length)
    const played = playAction(current, action.intent, random)
    handlePlayedActionWithDrama(current, played)
  }, [handlePlayedActionWithDrama])

  // Le coach tranche la contestation : on rejoue l'intention avec la reponse
  // imposee, puis resolution normale.
  const resolveContest = useCallback((choice: NonNullable<ActionIntent['contestAction']>) => {
    const current = engineRef.current
    setPendingContest((pending) => {
      if (!current || !pending) return pending
      const contestedIntent: ActionIntent = { ...pending.action.intent, contestedBy: pending.defenderId, contestAction: choice }
      setAwaitingDecision(false)
      awaitingDecisionRef.current = false
      setDecisionLabel(null)
      actionCountRef.current += 1
      const random = new SeededRandom(current.seed + current.events.length)
      const played = playAction(current, contestedIntent, random)
      handlePlayedActionWithDrama(current, played)
      return null
    })
  }, [handlePlayedActionWithDrama])

  // L'IA tranche la contestation a la place du coach.
  const letContestAiDecide = useCallback(() => {
    const current = engineRef.current
    setPendingContest((pending) => {
      if (!current || !pending) return pending
      const auto = contestAction(current, pending.action.intent)
      const contestedIntent: ActionIntent = auto.contestedBy
        ? auto
        : { ...pending.action.intent, contestedBy: pending.defenderId, contestAction: 'contain' as const }
      setAwaitingDecision(false)
      awaitingDecisionRef.current = false
      setDecisionLabel(null)
      actionCountRef.current += 1
      const random = new SeededRandom(current.seed + current.events.length)
      const played = playAction(current, contestedIntent, random)
      handlePlayedActionWithDrama(current, played)
      return null
    })
  }, [handlePlayedActionWithDrama])

  // Fenetre de decision : le porteur Nangis dispose des actions du moteur.
  // On sélectionne automatiquement le porteur pour que l'ActionPanel soit immédiatement affiché.
  const openDecisionWindow = useCallback((state: MatchState) => {
    const holder = state.players[state.ball.holderId]
    if (!holder) return false

    if (holder.team === 'lagny') {
      // Fenetre defensive (doc 17, ecart E-001) : une fois par possession
      // adverse, le coach choisit le marquage strict ou l aide.
      if (controlMode !== 'coach') return false
      const defenders = Object.values(state.players)
        .filter((p) => p.team === 'nangis' && p.isOnCourt && p.role !== 'goalkeeper')
        .sort((a, b) =>
          Math.hypot(a.position.x - holder.position.x, a.position.y - holder.position.y) -
          Math.hypot(b.position.x - holder.position.x, b.position.y - holder.position.y)
        )
      const defender = defenders[0]
      if (!defender) return false
      setSelectedPlayer({
        id: defender.id,
        name: defender.name,
        number: playerNumbers[defender.id] ?? 99,
        team: defender.team,
        position: defender.position,
        role: roleLabels[defender.role],
        hasBall: false,
        fatigue: Math.round(defender.energy),
        pressure: Math.round(defender.pressure)
      })
      setAwaitingDecision(true)
      awaitingDecisionRef.current = true
      setDecisionLabel(`Lagny attaque par ${holder.name} — organise la défense avec ${defender.name}`)
      refreshActions(state, defender.id)
      return true
    }

    const uiHolder: UIPlayer = {
      id: holder.id,
      name: holder.name,
      number: playerNumbers[holder.id] ?? 99,
      team: holder.team,
      position: holder.position,
      role: roleLabels[holder.role],
      hasBall: true,
      fatigue: Math.round(holder.energy),
      pressure: Math.round(holder.pressure)
    }
    setSelectedPlayer(uiHolder)
    setAwaitingDecision(true)
    awaitingDecisionRef.current = true
    setDecisionLabel(`${holder.name} (#${uiHolder.number}) a la balle — à toi de jouer`)
    refreshActions(state)
    return true
  }, [refreshActions, controlMode])

  // Demander a l IA de trancher : soit pour Nangis dans la fenetre ouverte, soit pour accelerer la sequence.
  const letAiDecide = useCallback(() => {
    const current = engineRef.current
    if (!current || isTransitioningRef.current) return

    if (awaitingDecisionRef.current) {
      const holderNow = current.players[current.ball.holderId]
      if (holderNow && holderNow.team === 'lagny') {
        // En defense, « IA décide » ferme la fenetre et fait jouer Lagny :
        // on force le compteur pour ne pas rouvrir la fenetre defensive.
        setAwaitingDecision(false)
        awaitingDecisionRef.current = false
        setDecisionLabel(null)
        actionCountRef.current = 1
      } else {
        const random = new SeededRandom(current.seed + current.events.length + 77)
        const trace = chooseNextAction(current, 'nangis', random, actionCountRef.current)
        setAwaitingDecision(false)
        awaitingDecisionRef.current = false
        setDecisionLabel(null)
        if (!trace) return
        actionCountRef.current += 1
        const played = playAction(current, trace.action, random)
        handlePlayedActionWithDrama(current, played)
        return
      }
    }

    // Si Lagny a le ballon (phase défensive), avancer immédiatement d'un pas d'action
    const holder = current.players[current.ball.holderId]
    if (!holder) return
    const random = new SeededRandom(current.seed + current.events.length * 31 + actionCountRef.current)
    const trace = chooseNextAction(current, holder.team, random, actionCountRef.current)
    const intent = trace?.action ?? fallbackAction(current)
    if (!intent) return
    actionCountRef.current += 1
    const played = playAction(current, intent, random)
    if (played.possessionChanged) {
      possessionCountRef.current += 1
      lastAttackingTeamRef.current = opposing(holder.team)
      actionCountRef.current = 0
    }
    if (played.event.type === 'shoot' || (played.event.type === 'pass' && played.event.result === 'intercepted')) {
      handlePlayedActionWithDrama(current, played)
    } else {
      setFeedback(formatCausalFeedback(played.event, played.state))
      syncState(played.state)
      checkMatchEnd(played.state)
    }
  }, [handlePlayedActionWithDrama, syncState, checkMatchEnd])
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
  isTransitioningRef.current = false
  setPendingContest(null)
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
  isTransitioningRef.current = false
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

// Pendant la possession adverse, cliquer un defenseur Nangis lui donne ses
// options defensives du moteur (marquage strict, aide) sans bloquer le match.
useEffect(() => {
  if (!engineState || !matchState) return
  if (matchState.possession !== 'lagny') return
  if (!selectedPlayer || selectedPlayer.team !== 'nangis') return
  refreshActions(engineState, selectedPlayer.id)
}, [engineState, matchState, selectedPlayer, refreshActions])

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
  if (isPaused || isMatchOver || awaitingDecision || climax !== null || isTransitioningRef.current) return
  const state = engineRef.current
  if (!state) return

  if (controlMode === 'coach') {
    const holder = state.players[state.ball.holderId]
    // Fenetre offensive Nangis, ou fenetre defensive une fois par possession
    // Lagny (doc 05 : pauses sur les situations significatives).
    if (holder && (holder.team === 'nangis' || actionCountRef.current === 0)) {
      openDecisionWindow(state)
      return
    }
  }

  const timer = setTimeout(() => {
    if (isTransitioningRef.current || awaitingDecisionRef.current || isPaused || isMatchOver) return
    const current = engineRef.current
    if (!current) return
    const holder = current.players[current.ball.holderId]
    if (!holder) return
    const random = new SeededRandom(current.seed + current.events.length * 31 + actionCountRef.current)
    const trace = chooseNextAction(current, holder.team, random, actionCountRef.current)
    const intent = trace?.action ?? fallbackAction(current)
    if (!intent) {
      stallRef.current += 1
      if (stallRef.current > 4) {
        stallRef.current = 0
        actionCountRef.current = 0
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
      actionCountRef.current = 0
    }

    if (played.event.type === 'shoot' || (played.event.type === 'pass' && played.event.result === 'intercepted')) {
      handlePlayedActionWithDrama(current, played)
    } else {
      setFeedback(formatCausalFeedback(played.event, played.state))
      syncState(played.state)
      checkMatchEnd(played.state)
    }
  }, Math.max(300, 950 / speed))

  return () => clearTimeout(timer)
}, [isPaused, isMatchOver, awaitingDecision, climax, controlMode, speed, matchState, openDecisionWindow, syncState, checkMatchEnd, handlePlayedActionWithDrama])

// Trajectoires tactiques pour l affichage sur le terrain pendant la fenetre de decision
const trajectories = useMemo<TacticalTrajectory[]>(() => {
  if (!awaitingDecision || !matchState) return []
  const holder = (selectedPlayer && matchState.players.find((p) => p.id === selectedPlayer.id)) || matchState.players.find((p) => p.hasBall)
  if (!holder) return []

  return availableActions
    .map((action): TacticalTrajectory | null => {
      if (action.intent.type === 'pass' && action.intent.targetId) {
        const target = matchState.players.find((p) => p.id === action.intent.targetId)
        if (!target) return null
        return {
          id: `traj-${action.id}`,
          actionId: action.id,
          type: 'pass' as const,
          from: holder.position,
          to: target.position,
          risk: action.risk,
          label: `Passe #${target.number} ${target.name}`,
          targetPlayerId: target.id
        }
      }
      if (action.intent.type === 'shoot') {
        return {
          id: `traj-${action.id}`,
          actionId: action.id,
          type: 'shoot' as const,
          from: holder.position,
          to: { x: 40, y: 10 },
          risk: action.risk,
          label: action.name
        }
      }
      // Croise : tracer les deux couloirs qui s'echangent (mandat pilote-sim).
      // On dessine la course du porteur vers le couloir oppose.
      if (action.intent.type === 'cross' && action.intent.targetId) {
        const target = matchState.players.find((p) => p.id === action.intent.targetId)
        if (!target) return null
        return {
          id: `traj-${action.id}`,
          actionId: action.id,
          type: 'cross' as const,
          from: holder.position,
          to: { x: (holder.position.x + target.position.x) / 2, y: Math.max(1, Math.min(19, 20 - holder.position.y)) },
          risk: action.risk,
          label: `${action.name} — tirer ou passer derrière`,
          targetPlayerId: target.id
        }
      }
      if ((action.intent.type === 'duel' || action.intent.type === 'fix') && action.intent.targetId) {
        const target = matchState.players.find((p) => p.id === action.intent.targetId)
        if (!target) return null
        return {
          id: `traj-${action.id}`,
          actionId: action.id,
          type: action.intent.type as 'duel' | 'fix',
          from: holder.position,
          to: target.position,
          risk: action.risk,
          label: action.name,
          targetPlayerId: target.id
        }
      }
      if (action.intent.type === 'run' && action.intent.targetPosition) {
        return {
          id: `traj-${action.id}`,
          actionId: action.id,
          type: 'run' as const,
          from: holder.position,
          to: action.intent.targetPosition,
          risk: action.risk,
          label: action.name
        }
      }
      if ((action.intent.type === 'mark' || action.intent.type === 'help' || action.intent.type === 'press' || action.intent.type === 'retreat' || action.intent.type === 'intercept') && action.intent.targetId) {
        const target = matchState.players.find((p) => p.id === action.intent.targetId)
        if (!target) return null
        return {
          id: `traj-${action.id}`,
          actionId: action.id,
          type: 'duel' as const,
          from: holder.position,
          to: target.position,
          risk: action.risk,
          label: action.name,
          targetPlayerId: target.id
        }
      }
      return null
    })
    .filter((t): t is TacticalTrajectory => t !== null)
}, [awaitingDecision, matchState, availableActions, selectedPlayer])

// Contexte de duel actif pour le panneau lateral
const activeDuel = useMemo<DuelContext | null>(() => {
  if (!matchState || !engineState) return null
  const holder = matchState.players.find((p) => p.hasBall)
  if (!holder || holder.team !== 'nangis') return null

  const engineHolder = engineState.players[holder.id]
  if (!engineHolder) return null

  const duelAction = availableActions.find((a) => a.intent.type === 'duel' && a.intent.targetId)
  let defender = duelAction ? engineState.players[duelAction.intent.targetId!] : null

  if (!defender) {
    const opponents = Object.values(engineState.players).filter(
      (p) => p.team === 'lagny' && p.isOnCourt && p.role !== 'goalkeeper'
    )
    let minDist = 7.5
    for (const opp of opponents) {
      const d = Math.hypot(opp.position.x - engineHolder.position.x, opp.position.y - engineHolder.position.y)
      if (d < minDist) {
        minDist = d
        defender = opp
      }
    }
  }

  if (!defender) return null

  return {
    attacker: {
      id: engineHolder.id,
      name: engineHolder.name,
      number: playerNumbers[engineHolder.id] ?? 99,
      role: roleLabels[engineHolder.role] ?? engineHolder.role,
      duel: Math.round(engineHolder.duel),
      acceleration: Math.round(engineHolder.acceleration),
      shooting: Math.round(engineHolder.shooting)
    },
    defender: {
      id: defender.id,
      name: defender.name,
      number: playerNumbers[defender.id] ?? 99,
      role: roleLabels[defender.role] ?? defender.role,
      defense: Math.round(defender.defense),
      anticipation: Math.round(defender.anticipation)
    },
    duelActionId: duelAction?.id
  }
}, [matchState, engineState, availableActions])

// Exécution d'un duel avec direction et intention sélectionnées (Doc 05 - Sections 15, 16, 17)
const executeDuelWithTactics = useCallback(
  (
    actionId: string,
    options?: { direction?: 'inside' | 'outside'; intention?: 'explode' | 'feint' | 'delay' }
  ) => {
    const action = actionsRef.current.find((a) => a.id === actionId)
    if (!action) return

    let modifiedIntention: ActionIntent['intention'] = 'attack-inside'
    if (options?.direction === 'outside') {
      modifiedIntention = 'attack-outside'
    } else if (options?.intention === 'explode') {
      modifiedIntention = 'accelerate'
    } else if (options?.intention === 'delay') {
      modifiedIntention = 'temporize'
    } else if (options?.intention === 'feint') {
      modifiedIntention = 'hidden'
    }

    const intentWithTactics: ActionIntent = {
      ...action.intent,
      intention: modifiedIntention
    }

    performAction({
      ...action,
      intent: intentWithTactics
    })
  },
  [performAction]
)

// Causerie d'équipe lors d'un temps mort (Doc 05 - Sections 67, 68)
const applyCauserie = useCallback(
  (type: 'calm' | 'accelerate' | 'focus-aaron' | 'mark-malone') => {
    const current = engineRef.current
    if (!current) return
    const next = structuredClone(current)

    if (type === 'calm') {
      Object.values(next.players).forEach((p) => {
        if (p.team === 'nangis') p.pressure = Math.max(0, p.pressure - 20)
      })
      setFeedback({
        title: 'Causerie : Calmer le jeu',
        detail: 'La pression de Nangis diminue de 20%, lucidité collective retrouvée',
        success: true,
        type: 'timeout'
      })
    } else if (type === 'accelerate') {
      Object.values(next.players).forEach((p) => {
        if (p.team === 'nangis') p.confidence = Math.min(100, p.confidence + 15)
      })
      setFeedback({
        title: 'Causerie : Accélérer le tempo',
        detail: 'Les joueurs se projettent plus vite dans les intervalles',
        success: true,
        type: 'timeout'
      })
    } else if (type === 'focus-aaron') {
      if (next.players.aaron) next.players.aaron.confidence = 100
      setFeedback({
        title: 'Causerie : Fixer sur Aaron',
        detail: 'Priorité offensive donnée au secteur droit',
        success: true,
        type: 'timeout'
      })
    } else if (type === 'mark-malone') {
      next.teams.nangis.system = '1-5'
      setFeedback({
        title: 'Causerie : Verrouiller Malone',
        detail: 'Passage en défense 1-5 étagée pour neutraliser le demi-centre',
        success: true,
        type: 'timeout'
      })
    }

    syncState(next)
  },
  [syncState]
)

// Statistiques en direct du match (Doc 05 - Sections 91, 92)
const liveStats = useMemo<LiveMatchStats>(() => {
  const events = engineState?.events ?? []
  const shotsNangis = events.filter(
    (e) => e.type === 'shoot' && engineState?.players[e.actorId ?? '']?.team === 'nangis'
  )
  const shotsLagny = events.filter(
    (e) => e.type === 'shoot' && engineState?.players[e.actorId ?? '']?.team === 'lagny'
  )
  const goalsNangis = shotsNangis.filter((e) => e.result === 'goal').length
  const goalsLagny = shotsLagny.filter((e) => e.result === 'goal').length
  const savesNangis = events.filter(
    (e) => e.type === 'shoot' && e.result === 'save' && engineState?.players[e.actorId ?? '']?.team === 'lagny'
  ).length
  const savesLagny = events.filter(
    (e) => e.type === 'shoot' && e.result === 'save' && engineState?.players[e.actorId ?? '']?.team === 'nangis'
  ).length
  const turnoversNangis = events.filter(
    (e) => e.type === 'pass' && e.result === 'intercepted' && engineState?.players[e.actorId ?? '']?.team === 'nangis'
  ).length
  const turnoversLagny = events.filter(
    (e) => e.type === 'pass' && e.result === 'intercepted' && engineState?.players[e.actorId ?? '']?.team === 'lagny'
  ).length
  const foulsNangis = events.filter(
    (e) => e.type === 'duel' && e.result === 'foul-defense' && engineState?.players[e.targetId ?? '']?.team === 'nangis'
  ).length
  const foulsLagny = events.filter(
    (e) => e.type === 'duel' && e.result === 'foul-defense' && engineState?.players[e.targetId ?? '']?.team === 'lagny'
  ).length

  const effNangis = shotsNangis.length > 0 ? Math.round((goalsNangis / shotsNangis.length) * 100) : 0
  const effLagny = shotsLagny.length > 0 ? Math.round((goalsLagny / shotsLagny.length) * 100) : 0

  const observations: string[] = []
  if ((engineState?.memory?.patterns['pass:intercepted']?.occurrences ?? 0) >= 2) {
    observations.push('Lagny lit bien les lignes de passes axiales : varier avec les ailiers')
  } else {
    observations.push('Circulation de balle fluide, maintenir la fixation')
  }
  if (engineState?.teams.lagny.system === '1-5') {
    observations.push('Lagny est passé en 1-5 étagé pour couper le demi-centre')
  } else {
    observations.push('Défense 6-0 compacte : chercher les tirs aux 9 mètres ou les décalages')
  }
  if (turnoversLagny >= 2) {
    observations.push('Repli défensif de Nangis efficace sur les relances')
  }

  return {
    score: { nangis: engineState?.teams.nangis.score ?? 0, lagny: engineState?.teams.lagny.score ?? 0 },
    possessions: { nangis: possessionCountRef.current, lagny: Math.max(0, possessionCountRef.current - 1) },
    shots: { nangis: shotsNangis.length, lagny: shotsLagny.length },
    saves: { nangis: savesNangis, lagny: savesLagny },
    turnovers: { nangis: turnoversNangis, lagny: turnoversLagny },
    fouls: { nangis: foulsNangis, lagny: foulsLagny },
    shotEfficiency: { nangis: effNangis, lagny: effLagny },
    keyObservations: observations
  }
}, [engineState])

return {
  matchState,
  engineState,
  isPaused,
  togglePause,
  selectedPlayer,
  selectPlayer,
  availableActions,
  executeAction,
  executeDuelWithTactics,
  pendingContest,
  resolveContest,
  letContestAiDecide,
  speed,
  setSpeed,
  controlMode,
  setControlMode,
  awaitingDecision,
  decisionLabel,
  letAiDecide,
  setSystem,
  takeTimeout,
  applyCauserie,
  defensiveStance,
  setDefensiveStance,
  isExpertMode,
  setIsExpertMode,
  isMatchOver,
  restartMatch,
  seed,
  feedback,
  trajectories,
  hoveredActionId,
  setHoveredActionId,
  climax,
  activeDuel,
  liveStats
}
}