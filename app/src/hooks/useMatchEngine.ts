import { useState, useEffect, useRef, useCallback } from 'react'
import { createPilotMatch } from '@engine/match.js'
import { chooseNextAction } from '@engine/ai.js'
import { resolveAction } from '@engine/engine.js'
import { SeededRandom } from '@engine/random.js'
import type { MatchState, TeamId, ActionIntent } from '@engine/types.js'

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
  possession: 'nangis' | 'lagny'
}

interface Action {
  id: string
  name: string
  description: string
  risk?: 'safe' | 'moderate' | 'risky'
  enabled: boolean
  intent: ActionIntent
}

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
  const [isPaused, setIsPaused] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<UIPlayer | null>(null)
  const [availableActions, setAvailableActions] = useState<Action[]>([])
  const [speed, setSpeed] = useState(1)
  const [awaitingDecision, setAwaitingDecision] = useState(false)
  const [isMatchOver, setIsMatchOver] = useState(false)
  
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef<number>(0)
  const actionCountRef = useRef(0)
  const possessionCountRef = useRef(0)

  // Convertir l'état du moteur en état UI
  const convertToUIState = useCallback((state: MatchState): UIMatchState => {
    const players: UIPlayer[] = Object.values(state.players)
      .filter(p => p.isOnCourt)
      .map(p => ({
        id: p.id,
        name: p.name,
        number: playerNumbers[p.id] || 99,
        team: p.team,
        position: p.position,
        role: roleLabels[p.role],
        hasBall: state.ball.holderId === p.id,
        fatigue: Math.round(p.energy),
        pressure: Math.round(p.pressure)
      }))

    return {
      players,
      ball: { position: state.ball.position },
      score: {
        nangis: state.teams.nangis.score,
        lagny: state.teams.lagny.score
      },
      time: state.timeSeconds,
      possession: state.teams.nangis.possession ? 'nangis' : 'lagny'
    }
  }, [])

  // Initialiser le match
  const initializeMatch = useCallback(() => {
    const initialState = createPilotMatch(Date.now())
    setEngineState(initialState)
    setMatchState(convertToUIState(initialState))
    setIsPaused(true)
    setIsMatchOver(false)
    setSelectedPlayer(null)
    setAvailableActions([])
    actionCountRef.current = 0
    possessionCountRef.current = 0
  }, [convertToUIState])

  useEffect(() => {
    initializeMatch()
  }, [initializeMatch])

  // Générer les actions disponibles pour un joueur
  const generateAvailableActions = useCallback((state: MatchState, playerId: string): Action[] => {
    const player = state.players[playerId]
    if (!player || state.ball.holderId !== playerId) {
      return []
    }

    const team = player.team as TeamId
    const actions: Action[] = []

    // Passe
    const teammates = Object.values(state.players).filter(
      p => p.team === team && p.isOnCourt && p.id !== playerId && p.role !== 'goalkeeper'
    )
    
    teammates.forEach(target => {
      const distance = Math.sqrt(
        Math.pow(target.position.x - player.position.x, 2) +
        Math.pow(target.position.y - player.position.y, 2)
      )
      
      let risk: 'safe' | 'moderate' | 'risky' = 'safe'
      if (distance > 15) risk = 'moderate'
      if (distance > 20) risk = 'risky'

      actions.push({
        id: `pass-${target.id}`,
        name: 'Passe',
        description: `Passer à ${target.name}`,
        risk,
        enabled: true,
        intent: {
          type: 'pass',
          actorId: playerId,
          targetId: target.id,
          intention: 'secure'
        }
      })
    })

    // Duel
    const opponents = Object.values(state.players).filter(
      p => p.team !== team && p.isOnCourt && p.role !== 'goalkeeper'
    )
    
    const nearOpponents = opponents.filter(opp => {
      const distance = Math.sqrt(
        Math.pow(opp.position.x - player.position.x, 2) +
        Math.pow(opp.position.y - player.position.y, 2)
      )
      return distance < 3
    })

    nearOpponents.forEach(opponent => {
      actions.push({
        id: `duel-${opponent.id}`,
        name: 'Duel',
        description: `Affronter ${opponent.name}`,
        risk: player.duel > 80 ? 'moderate' : 'risky',
        enabled: true,
        intent: {
          type: 'duel',
          actorId: playerId,
          targetId: opponent.id,
          intention: 'attack-inside'
        }
      })
    })

    // Tir
    const isInShootingRange = 
      (team === 'nangis' && player.position.y > 14) ||
      (team === 'lagny' && player.position.y < 6)

    if (isInShootingRange) {
      actions.push({
        id: 'shoot-power',
        name: 'Tir puissant',
        description: 'Tir à pleine puissance',
        risk: 'moderate',
        enabled: true,
        intent: {
          type: 'shoot',
          actorId: playerId,
          shotType: 'power',
          shotSide: 'far',
          shotHeight: 'high'
        }
      })

      actions.push({
        id: 'shoot-placed',
        name: 'Tir placé',
        description: 'Tir précis et contrôlé',
        risk: 'safe',
        enabled: true,
        intent: {
          type: 'shoot',
          actorId: playerId,
          shotType: 'placed',
          shotSide: 'near',
          shotHeight: 'low'
        }
      })
    }

    // Fixation
    nearOpponents.slice(0, 1).forEach(opponent => {
      actions.push({
        id: `fix-${opponent.id}`,
        name: 'Fixation',
        description: `Fixer ${opponent.name} pour ouvrir l'espace`,
        risk: 'safe',
        enabled: true,
        intent: {
          type: 'fix',
          actorId: playerId,
          targetId: opponent.id,
          intention: 'attract'
        }
      })
    })

    return actions
  }, [])

  // Exécuter une action choisie par le joueur
  const executeAction = useCallback((actionId: string) => {
    if (!engineState || !selectedPlayer) return

    const action = availableActions.find(a => a.id === actionId)
    if (!action) return

    const random = new SeededRandom(engineState.seed + engineState.events.length)
    const resolution = resolveAction(engineState, action.intent, random)
    
    setEngineState(resolution.state)
    setMatchState(convertToUIState(resolution.state))
    setSelectedPlayer(null)
    setAvailableActions([])
    setAwaitingDecision(false)
    actionCountRef.current += 1

    // Vérifier si la possession a changé ou si but
    if (resolution.event.result === 'goal' || 
        resolution.event.result === 'intercepted' ||
        !resolution.state.teams[selectedPlayer.team].possession) {
      actionCountRef.current = 0
      possessionCountRef.current += 1
      setIsPaused(true)
    }

    // Vérifier fin de match (60 possessions ou 60 minutes)
    if (possessionCountRef.current >= 60 || resolution.state.timeSeconds >= 3600) {
      setIsMatchOver(true)
      setIsPaused(true)
    }
  }, [engineState, selectedPlayer, availableActions, convertToUIState])

  // Sélectionner un joueur
  const selectPlayer = useCallback((playerId: string) => {
    if (!engineState || !matchState) return

    const player = matchState.players.find(p => p.id === playerId)
    if (!player) return

    // Vérifier que c'est le porteur du ballon
    if (player.hasBall && awaitingDecision) {
      setSelectedPlayer(player)
      setAvailableActions(generateAvailableActions(engineState, playerId))
    } else {
      setSelectedPlayer(player)
      setAvailableActions([])
    }
  }, [engineState, matchState, awaitingDecision, generateAvailableActions])

  // Boucle de simulation
  useEffect(() => {
    if (!engineState || isPaused || awaitingDecision || isMatchOver) return

    const simulate = (timestamp: number) => {
      if (!lastUpdateRef.current) {
        lastUpdateRef.current = timestamp
      }

      const elapsed = timestamp - lastUpdateRef.current

      // Mise à jour selon la vitesse (16ms pour 60fps * speed)
      if (elapsed > (16 / speed)) {
        lastUpdateRef.current = timestamp

        const team = engineState.teams.nangis.possession ? 'nangis' : 'lagny'
        const random = new SeededRandom(engineState.seed + engineState.events.length)
        
        // IA décide de l'action
        const decision = chooseNextAction(engineState, team as TeamId, random, actionCountRef.current)
        
        if (!decision) {
          // Fin de possession
          actionCountRef.current = 0
          setIsPaused(true)
          return
        }

        // Toutes les 2-3 actions, pause pour décision humaine si possession Nangis
        if (team === 'nangis' && actionCountRef.current > 0 && actionCountRef.current % 2 === 0) {
          setAwaitingDecision(true)
          setIsPaused(true)
          const holder = Object.values(engineState.players).find(p => p.id === engineState.ball.holderId)
          if (holder) {
            const uiPlayer = matchState?.players.find(p => p.id === holder.id)
            if (uiPlayer) {
              setSelectedPlayer(uiPlayer)
              setAvailableActions(generateAvailableActions(engineState, holder.id))
            }
          }
          return
        }

        const resolution = resolveAction(engineState, decision.action, random)
        setEngineState(resolution.state)
        setMatchState(convertToUIState(resolution.state))
        actionCountRef.current += 1

        // Pause après but ou turnover
        if (resolution.event.result === 'goal' || 
            resolution.event.result === 'intercepted' ||
            resolution.event.result === 'save') {
          actionCountRef.current = 0
          possessionCountRef.current += 1
          setIsPaused(true)
        }

        // Vérifier fin de match
        if (possessionCountRef.current >= 60 || resolution.state.timeSeconds >= 3600) {
          setIsMatchOver(true)
          setIsPaused(true)
        }
      }

      animationFrameRef.current = requestAnimationFrame(simulate)
    }

    animationFrameRef.current = requestAnimationFrame(simulate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [engineState, isPaused, speed, awaitingDecision, isMatchOver, convertToUIState, generateAvailableActions, matchState])

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev)
    if (awaitingDecision) {
      setAwaitingDecision(false)
    }
  }, [awaitingDecision])

  return {
    matchState,
    engineState,
    isPaused,
    selectedPlayer,
    availableActions,
    selectPlayer,
    executeAction,
    togglePause,
    setSpeed,
    speed,
    isMatchOver,
    restartMatch: initializeMatch
  }
}