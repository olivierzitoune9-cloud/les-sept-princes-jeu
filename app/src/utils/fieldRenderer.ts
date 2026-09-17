import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  GOAL_AREA_RADIUS,
  FREE_THROW_LINE,
  PENALTY_LINE,
  GOAL_WIDTH,
  GOAL_HEIGHT,
  SCALE,
  PLAYER_RADIUS,
  BALL_RADIUS,
  SELECTION_RING_WIDTH,
  COLORS,
  fieldToCanvas
} from './fieldConstants'

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

export function drawField(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  ball: Ball,
  selectedPlayerId: string | null
) {
  const width = FIELD_WIDTH * SCALE
  const height = FIELD_HEIGHT * SCALE

  // Fond du terrain
  ctx.fillStyle = COLORS.field
  ctx.fillRect(0, 0, width, height)

  // Ligne médiane
  ctx.strokeStyle = COLORS.lines
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(width / 2, 0)
  ctx.lineTo(width / 2, height)
  ctx.stroke()

  // Zones des 6m (haut et bas)
  drawGoalArea(ctx, true) // Haut
  drawGoalArea(ctx, false) // Bas

  // Lignes des 9m (haut et bas)
  drawFreeThrowLine(ctx, true)
  drawFreeThrowLine(ctx, false)

  // Lignes des 7m (penalty)
  drawPenaltyLine(ctx, true)
  drawPenaltyLine(ctx, false)

  // Buts
  drawGoal(ctx, true)
  drawGoal(ctx, false)

  // Ballon
  drawBall(ctx, ball)

  // Joueurs
  players.forEach(player => {
    const isSelected = player.id === selectedPlayerId
    drawPlayer(ctx, player, isSelected)
  })
}

function drawGoalArea(ctx: CanvasRenderingContext2D, top: boolean) {
  const centerY = top ? 0 : FIELD_HEIGHT * SCALE
  const radius = GOAL_AREA_RADIUS * SCALE
  const centerX = (FIELD_WIDTH / 2) * SCALE

  // Zone colorée
  ctx.fillStyle = COLORS.zone6m
  ctx.beginPath()
  if (top) {
    ctx.arc(centerX, centerY, radius, 0, Math.PI, false)
    ctx.lineTo(centerX - radius, 0)
  } else {
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
    ctx.lineTo(centerX - radius, FIELD_HEIGHT * SCALE)
  }
  ctx.closePath()
  ctx.fill()

  // Ligne
  ctx.strokeStyle = COLORS.lines
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(centerX, centerY, radius, top ? 0 : Math.PI, top ? Math.PI : Math.PI * 2)
  ctx.stroke()
}

function drawFreeThrowLine(ctx: CanvasRenderingContext2D, top: boolean) {
  const y = top ? FREE_THROW_LINE * SCALE : (FIELD_HEIGHT - FREE_THROW_LINE) * SCALE
  const centerX = (FIELD_WIDTH / 2) * SCALE
  const lineLength = 16 * SCALE // Ligne pointillée de 16m

  ctx.strokeStyle = COLORS.zone9m
  ctx.lineWidth = 1
  ctx.setLineDash([5, 5])
  ctx.beginPath()
  ctx.moveTo(centerX - lineLength / 2, y)
  ctx.lineTo(centerX + lineLength / 2, y)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawPenaltyLine(ctx: CanvasRenderingContext2D, top: boolean) {
  const y = top ? PENALTY_LINE * SCALE : (FIELD_HEIGHT - PENALTY_LINE) * SCALE
  const centerX = (FIELD_WIDTH / 2) * SCALE

  ctx.fillStyle = COLORS.lines
  ctx.beginPath()
  ctx.arc(centerX, y, 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawGoal(ctx: CanvasRenderingContext2D, top: boolean) {
  const centerX = (FIELD_WIDTH / 2) * SCALE
  const y = top ? -2 : FIELD_HEIGHT * SCALE + 2
  const goalWidth = GOAL_WIDTH * SCALE
  const goalHeight = GOAL_HEIGHT * SCALE

  ctx.strokeStyle = COLORS.lines
  ctx.lineWidth = 3
  ctx.strokeRect(
    centerX - goalWidth / 2,
    top ? y - goalHeight : y,
    goalWidth,
    goalHeight
  )
}

function drawBall(ctx: CanvasRenderingContext2D, ball: Ball) {
  const [x, y] = fieldToCanvas(ball.position.x, ball.position.y)

  // Ombre
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.arc(x + 2, y + 2, BALL_RADIUS * SCALE, 0, Math.PI * 2)
  ctx.fill()

  // Ballon
  ctx.fillStyle = COLORS.ball
  ctx.beginPath()
  ctx.arc(x, y, BALL_RADIUS * SCALE, 0, Math.PI * 2)
  ctx.fill()

  // Brillance
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  ctx.beginPath()
  ctx.arc(x - BALL_RADIUS * SCALE * 0.3, y - BALL_RADIUS * SCALE * 0.3, BALL_RADIUS * SCALE * 0.4, 0, Math.PI * 2)
  ctx.fill()
}

function drawPlayer(ctx: CanvasRenderingContext2D, player: Player, isSelected: boolean) {
  const [x, y] = fieldToCanvas(player.position.x, player.position.y)
  const radius = PLAYER_RADIUS * SCALE
  const teamColor = player.team === 'nangis' ? COLORS.nangis : COLORS.lagny

  // Anneau de sélection
  if (isSelected) {
    ctx.strokeStyle = COLORS.selected
    ctx.lineWidth = SELECTION_RING_WIDTH * SCALE
    ctx.beginPath()
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Anneau de fatigue (si < 70%)
  if (player.fatigue !== undefined && player.fatigue < 70) {
    const fatigueAngle = (player.fatigue / 100) * Math.PI * 2
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, radius + 2, -Math.PI / 2, -Math.PI / 2 + fatigueAngle)
    ctx.stroke()
  }

  // Anneau de pression (si > 50)
  if (player.pressure !== undefined && player.pressure > 50) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, radius + 6, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Ombre du jeton
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  ctx.beginPath()
  ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2)
  ctx.fill()

  // Jeton joueur
  ctx.fillStyle = teamColor
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  // Bordure du jeton
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.stroke()

  // Numéro
  ctx.fillStyle = COLORS.text
  ctx.font = `bold ${radius * 1.2}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(player.number.toString(), x, y - 2)

  // Nom (petit, en dessous)
  ctx.fillStyle = COLORS.textSecondary
  ctx.font = `${radius * 0.5}px sans-serif`
  ctx.fillText(player.name, x, y + radius + 10)

  // Indicateur ballon
  if (player.hasBall) {
    ctx.fillStyle = COLORS.ball
    ctx.beginPath()
    ctx.arc(x, y + radius + 4, 4, 0, Math.PI * 2)
    ctx.fill()
  }
}
