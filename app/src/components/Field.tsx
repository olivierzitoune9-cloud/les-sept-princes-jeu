import { useEffect, useRef, useState } from 'react'
import { drawField, type TacticalTrajectory, type OpenIntervalMarker } from '../utils/fieldRenderer'
import {
  CANVAS_WIDTH_METRES,
  CANVAS_HEIGHT_METRES,
  FULL_VIEWPORT,
  halfCourtViewport,
  lerpViewport,
  canvasToCourt,
  type CourtViewport
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
  // Camera (D-022) : suit la moitie attaquee par defaut, vue complete au choix.
  attackingTeam?: 'nangis' | 'lagny'
  // Ralenti cinema : les duels et les tirs ralentissent le temps un instant.
  slowMotion?: boolean
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
  attackingTeam = null,
  slowMotion = false,
  onPlayerSelect,
  onTrajectorySelect,
  onCourtClick
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [pxm, setPxm] = useState(14)
  const [fullView, setFullView] = useState(false)
  const trajectoriesRef = useRef<TacticalTrajectory[]>(trajectories)
  trajectoriesRef.current = trajectories
  const hoveredActionIdRef = useRef<string | null>(hoveredActionId)
  hoveredActionIdRef.current = hoveredActionId

  const animatedPositionsRef = useRef<Map<string, AnimatedPosition>>(new Map())
  const animatedBallRef = useRef<AnimatedPosition>({
    current: { x: 20, y: 10 },
    target: { x: 20, y: 10 }
  })
  // La camera est un viewport anime : elle glisse vers la cible, jamais
  // de teleportation (07 §2 : aucun saut de jetons, aucun saut de cadre).
  const viewportRef = useRef<CourtViewport>(FULL_VIEWPORT)
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
  // Boucle d'animation : interpolation des positions, de la balle et du
  // viewport de camera, puis rendu. Le ralenti n'affecte QUE le confort
  // visuel de glisse, jamais la simulation (deja resolue par le moteur).
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const targetViewport = fullView || !attackingTeam
      ? FULL_VIEWPORT
      : halfCourtViewport(attackingTeam)

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp
      }

      const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000
      lastFrameTimeRef.current = timestamp
      // Ralenti cinema : la glisse des jetons et de la camera se fait plus
      // lente sur les moments decisifs. La simulation est deja terminee.
      const pace = slowMotion ? 0.35 : 1
      const lerpFactor = Math.min(1, deltaTime * 9 * pace)
      const cameraFactor = Math.min(1, deltaTime * 4 * pace)

      animatedPositionsRef.current.forEach((animated) => {
        animated.current.x += (animated.target.x - animated.current.x) * lerpFactor
        animated.current.y += (animated.target.y - animated.current.y) * lerpFactor
      })

      animatedBallRef.current.current.x +=
        (animatedBallRef.current.target.x - animatedBallRef.current.current.x) * lerpFactor
      animatedBallRef.current.current.y +=
        (animatedBallRef.current.target.y - animatedBallRef.current.current.y) * lerpFactor

      viewportRef.current = lerpViewport(viewportRef.current, targetViewport, cameraFactor)

      const animatedPlayers = matchState?.players.map(player => {
        const animated = animatedPositionsRef.current.get(player.id)
        return {
          ...player,
          position: animated ? { ...animated.current } : player.position
        }
      }) ?? []

      drawField(
        ctx,
        animatedPlayers,
        { position: { ...animatedBallRef.current.current } },
        selectedPlayer,
        pxm,
        trajectoriesRef.current,
        hoveredActionIdRef.current,
        openIntervals,
        viewportRef.current
      )

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [matchState, selectedPlayer, pxm, openIntervals, attackingTeam, slowMotion, fullView])

  // Clic : conversion inverse du canvas vers le terrain, en metres.
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!matchState || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const [courtX, courtY] = canvasToCourt(
      e.clientX - rect.left,
      e.clientY - rect.top,
      pxm,
      viewportRef.current
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
      // Un clic sur un pion ne doit jamais viser un point du terrain :
      // sinon un clic pendant une intention en attente se termine en doublon.
      onPlayerSelect(clickedPlayer.id)
      return
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
      <button
        className={`field-view-toggle ${fullView ? 'active' : ''}`}
        onClick={() => setFullView((value) => !value)}
        title={fullView ? 'Revenir a la camera action' : 'Voir tout le terrain'}
      >
        {fullView ? 'Camera action' : 'Vue complete'}
      </button>
    </div>
  )
}

export default Field
