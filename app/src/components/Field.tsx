import { useEffect, useRef, useState } from 'react'
import { drawField } from '../utils/fieldRenderer'
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

interface FieldProps {
  matchState: {
    players: Player[]
    ball: Ball
  } | null
  selectedPlayer: string | null
  onPlayerSelect: (playerId: string) => void
}

interface AnimatedPosition {
  current: { x: number; y: number }
  target: { x: number; y: number }
}

const Field: React.FC<FieldProps> = ({ matchState, selectedPlayer, onPlayerSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const animatedPositionsRef = useRef<Map<string, AnimatedPosition>>(new Map())
  const animatedBallRef = useRef<AnimatedPosition>({ 
    current: { x: 20, y: 10 }, 
    target: { x: 20, y: 10 } 
  })
  const animationFrameRef = useRef<number>()
  const lastFrameTimeRef = useRef<number>(0)

  // Redimensionnement adaptatif
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return
      
      const container = containerRef.current
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight
      
      // Terrain de base : 800x400 (40m x 20m à 20px/m)
      const baseWidth = 800
      const baseHeight = 400
      
      // Calculer l'échelle pour s'adapter au conteneur avec marges
      const scaleX = (containerWidth - 40) / baseWidth
      const scaleY = (containerHeight - 40) / baseHeight
      const newScale = Math.min(scaleX, scaleY, 2) // Max 2x
      
      setScale(newScale)
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Initialiser les positions animées quand matchState change
  useEffect(() => {
    if (!matchState) return

    matchState.players.forEach(player => {
      if (!animatedPositionsRef.current.has(player.id)) {
        animatedPositionsRef.current.set(player.id, {
          current: { ...player.position },
          target: { ...player.position }
        })
      } else {
        const animated = animatedPositionsRef.current.get(player.id)!
        animated.target = { ...player.position }
      }
    })

    // Mettre à jour la cible du ballon
    animatedBallRef.current.target = { ...matchState.ball.position }
  }, [matchState])

  // Animation continue avec interpolation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp
      }

      const deltaTime = (timestamp - lastFrameTimeRef.current) / 1000 // en secondes
      lastFrameTimeRef.current = timestamp

      // Interpoler les positions (lerp avec coefficient basé sur deltaTime)
      const lerpFactor = Math.min(1, deltaTime * 8) // Ajuster pour fluidité

      // Interpoler joueurs
      animatedPositionsRef.current.forEach((animated, playerId) => {
        animated.current.x += (animated.target.x - animated.current.x) * lerpFactor
        animated.current.y += (animated.target.y - animated.current.y) * lerpFactor
      })

      // Interpoler ballon
      animatedBallRef.current.current.x += 
        (animatedBallRef.current.target.x - animatedBallRef.current.current.x) * lerpFactor
      animatedBallRef.current.current.y += 
        (animatedBallRef.current.target.y - animatedBallRef.current.current.y) * lerpFactor

      // Créer les joueurs avec positions interpolées
      const animatedPlayers = matchState?.players.map(player => {
        const animated = animatedPositionsRef.current.get(player.id)
        return {
          ...player,
          position: animated ? { ...animated.current } : player.position
        }
      }) || []

      const animatedBall = {
        position: { ...animatedBallRef.current.current }
      }

      // Nettoyer et redessiner
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawField(ctx, animatedPlayers, animatedBall, selectedPlayer)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [matchState, selectedPlayer])

  // Gestion des clics
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!matchState || !canvasRef.current) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    
    // Position du clic dans le canvas (en tenant compte de l'échelle)
    const x = (e.clientX - rect.left) / scale
    const y = (e.clientY - rect.top) / scale
    
    // Convertir en coordonnées terrain (pixels -> mètres)
    const fieldX = x / 20
    const fieldY = y / 20

    // Trouver le joueur cliqué
    const clickedPlayer = matchState.players.find(player => {
      const dx = player.position.x - fieldX
      const dy = player.position.y - fieldY
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < 0.8 // Rayon du joueur
    })

    if (clickedPlayer) {
      onPlayerSelect(clickedPlayer.id)
    }
  }

  return (
    <div ref={containerRef} className="field-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="field-canvas"
        onClick={handleCanvasClick}
        style={{ transform: `scale(${scale})` }}
      />
    </div>
  )
}

export default Field
