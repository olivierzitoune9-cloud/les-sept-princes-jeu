import { useEffect, useRef, useState } from 'react'
import { drawField, type TacticalTrajectory, type OpenIntervalMarker } from '../utils/fieldRenderer'
import {
  CANVAS_WIDTH_METRES,
  CANVAS_HEIGHT_METRES,
  canvasToCourt
} from '../utils/fieldConstants'
import './Field.css'

interface Player {
  id: string
  name: string
  number: number
  team: 'nangis' | 'lagny'
  position: { x: number; y: number }
  hasBall?: boolean
  fatigue?: number
  pressure?: number
}

interface Ball {
  position: { x: number; y: number }
}

interface AnimatedPosition {
  current: { x: number; y: number }
  target: { x: number; y: number }
}

interface FieldProps {
  matchState: {
    players: Player[]
    ball: Ball
  } | null
  selectedPlayer: string | null
  trajectories?: TacticalTrajectory[]
  hoveredActionId?: string | null
  openIntervals?: OpenIntervalMarker[]
  onPlayerSelect: (playerId: string) => void
  onTrajectorySelect?: (actionId: string) => void
  onCourtClick?: (point: { x: number; y: number }) => void
}

const MIN_PXM = 7
const MAX_PXM = 34

const Field: React.FC<FieldProps> = ({
  matchState,
  selectedPlayer,
  trajectories = [],
  hoveredActionId = null,
  openIntervals = [],
  onPlayerSelect,
  onTrajectorySelect,
  onCourtClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pxm, setPxm] = useState(14)
  const trajectoriesRef = useRef<TacticalTrajectory[]>(trajectories)
  trajectoriesRef.current = trajectories
  const hoveredActionIdRef = useRef<string | null>(hoveredActionId)
  hoveredActionIdRef.current = hoveredActionId

  const animatedPositionsRef = useRef<Map<string, AnimatedPosition>>(new Map())
  const animatedBallRef = useRef<AnimatedPosition>({
    current: { x: 20, y: 10 },
    target: { x: 20, y: 10 }
  })
  const animationFrameRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(0)

  // L echelle d affichage depend du conteneur ; la proportion vient des
  // dimensions reelles du terrain, exprimees en metres.
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      const container = containerRef.current
      const next = Math.min(
        MAX_PXM,
        Math.max(
          MIN_PXM,
          Math.min(
            (container.clientWidth - 24) / CANVAS_WIDTH_METRES,
            (container.clientHeight - 24) / CANVAS_HEIGHT_METRES
          )
        )
      )
      setPxm(next)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // La resolution du canvas suit l echelle.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const width = Math.round(CANVAS_WIDTH_METRES * pxm)
    const height = Math.round(CANVAS_HEIGHT_METRES * pxm)
    if (canvas.width !== width) canvas.width = width
    if (canvas.height !== height) canvas.height = height
  }, [pxm])

  // Mettre a jour les cibles d interpolation quand l etat change.
  useEffect(() => {
    if (!matchState) return

    matchState.players.forEach(player => {
      const existing = animatedPositionsRef.current.get(player.id)
      if (existing) {
        existing.target = { ...player.position }
      } else {
        animatedPositionsRef.current.set(player.id, {
          current: { ...player.position },
          target: { ...player.position }
        })
      }
    })

    animatedBallRef.current.target = { ...matchState.ball.position }
  }, [matchState])

  // Animation continue avec interpolation.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp
      }

      const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000
      lastFrameTimeRef.current = timestamp
      const lerpFactor = Math.min(1, deltaTime * 9)

      animatedPositionsRef.current.forEach((animated) => {
        animated.current.x += (animated.target.x - animated.current.x) * lerpFactor
        animated.current.y += (animated.target.y - animated.current.y) * lerpFactor
      })

      animatedBallRef.current.current.x +=
        (animatedBallRef.current.target.x - animatedBallRef.current.current.x) * lerpFactor
      animatedBallRef.current.current.y +=
        (animatedBallRef.current.target.y - animatedBallRef.current.current.y) * lerpFactor

      const animatedPlayers = matchState?.players.map(player => {
        const animated = animatedPositionsRef.current.get(player.id)
        return {
          ...player,
          position: animated ? { ...animated.current } : player.position
        }
      }) ?? []

      const openIntervalsRef = openIntervals
      drawField(
        ctx,
        animatedPlayers,
        { position: { ...animatedBallRef.current.current } },
        selectedPlayer,
        pxm,
        trajectoriesRef.current,
        hoveredActionIdRef.current,
        openIntervalsRef
      )

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [matchState, selectedPlayer, pxm, openIntervals])

  // Clic : conversion inverse du canvas vers le terrain, en metres.
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!matchState || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const [courtX, courtY] = canvasToCourt(
      e.clientX - rect.left,
      e.clientY - rect.top,
      pxm
    )

    const clickedPlayer = matchState.players.find((player) =>
      Math.hypot(player.position.x - courtX, player.position.y - courtY) < 1.35
    )

    if (clickedPlayer) {
      // Si ce joueur est la cible d'une passe disponible, déclencher la passe immédiatement
      const passTraj = trajectoriesRef.current.find(
        (t) => t.type === 'pass' && t.targetPlayerId === clickedPlayer.id
      )
      if (passTraj && onTrajectorySelect) {
        onTrajectorySelect(passTraj.actionId)
        return
      }
      onPlayerSelect(clickedPlayer.id)
    }
    // Clic terrain libre : vise un point pour la volee planifiee.
    if (onCourtClick) {
      onCourtClick({ x: Math.max(0, Math.min(40, courtX)), y: Math.max(0, Math.min(20, courtY)) })
    }
  }

  return (
    <div ref={containerRef} className="field-container">
      <canvas
        ref={canvasRef}
        className="field-canvas"
        onClick={handleCanvasClick}
      />
    </div>
  )
}

export default Field