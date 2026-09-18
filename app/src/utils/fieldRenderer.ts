import {
  CANVAS_WIDTH_METRES,
  CANVAS_HEIGHT_METRES,
  PLAYER_RADIUS,
  BALL_RADIUS,
  SELECTION_RING_WIDTH,
  COLORS,
  courtToCanvas,
  teamColor,
  teamLightColor
} from './fieldConstants'
import {
  COURT_LENGTH,
  COURT_WIDTH,
  goalAreaLine,
  freeThrowLine,
  penaltyLine,
  goalkeeperLine,
  goalFrame,
  centreLine,
  substitutionZone
} from '@engine/court.js'

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

// Rendu du terrain : la geometrie vient integralement du moteur. L interface
// ne recalcule ni les zones, ni les buts, ni les distances de tir.
export function drawField(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  ball: Ball,
  selectedPlayerId: string | null,
  pxm: number
) {
  const toCanvas = (p: { x: number; y: number }): [number, number] =>
    courtToCanvas(p.x, p.y, pxm)

  // Fond hors terrain, puis surface du terrain.
  ctx.fillStyle = COLORS.backdrop
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  const [fieldLeft, fieldTop] = toCanvas({ x: 0, y: 0 })
  const fieldWidth = COURT_LENGTH * pxm
  const fieldHeight = COURT_WIDTH * pxm
  const gradient = ctx.createLinearGradient(0, fieldTop, 0, fieldTop + fieldHeight)
  gradient.addColorStop(0, COLORS.fieldGradientTop)
  gradient.addColorStop(1, COLORS.fieldGradientBottom)
  ctx.fillStyle = gradient
  ctx.fillRect(fieldLeft, fieldTop, fieldWidth, fieldHeight)

  // Contour et ligne mediane.
  ctx.strokeStyle = COLORS.linesStrong
  ctx.lineWidth = 2
  ctx.strokeRect(fieldLeft, fieldTop, fieldWidth, fieldHeight)
  strokeCourtLine(ctx, centreLine(), toCanvas, 2, COLORS.linesStrong)

  // Zones des 6 m : remplissage discret et ligne pleine.
  for (const team of ['nangis', 'lagny'] as const) {
    const area = goalAreaLine(team)
    ctx.fillStyle = COLORS.zone6m
    ctx.beginPath()
    area.forEach((point, index) => {
      const [x, y] = toCanvas(point)
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = COLORS.zone6mLine
    ctx.lineWidth = 2
    ctx.stroke()
  }

  // Lignes des 9 m : pointillees.
  for (const team of ['nangis', 'lagny'] as const) {
    ctx.strokeStyle = COLORS.zone9m
    ctx.lineWidth = 1.5
    ctx.setLineDash([7, 5])
    ctx.beginPath()
    freeThrowLine(team).forEach((point, index) => {
      const [x, y] = toCanvas(point)
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Lignes des 7 m et lignes de limitation du gardien (4 m).
  for (const team of ['nangis', 'lagny'] as const) {
    strokeCourtLine(ctx, penaltyLine(team), toCanvas, 2.5, COLORS.linesStrong)
    strokeCourtLine(ctx, goalkeeperLine(team), toCanvas, 1.5, COLORS.lines)
  }

  // Zone de changement le long de la ligne de touche.
  const [subStart, subEnd] = substitutionZone()
  strokeCourtLine(ctx, [subStart, subEnd], toCanvas, 2, COLORS.lines)
  for (const point of [subStart, subEnd]) {
    const [x, y] = toCanvas(point)
    ctx.beginPath()
    ctx.moveTo(x, y - 5)
    ctx.lineTo(x, y + 5)
    ctx.stroke()
  }

  // Cages.
  for (const team of ['nangis', 'lagny'] as const) {
    drawGoal(ctx, goalFrame(team), toCanvas)
  }

  // Ballon puis jetons.
  drawBall(ctx, ball, toCanvas, pxm)
  players.forEach((player) => {
    drawPlayer(ctx, player, player.id === selectedPlayerId, toCanvas, pxm)
  })
}

function strokeCourtLine(
  ctx: CanvasRenderingContext2D,
  points: readonly { x: number; y: number }[],
  toCanvas: (p: { x: number; y: number }) => [number, number],
  lineWidth: number,
  color: string
) {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.beginPath()
  points.forEach((point, index) => {
    const [x, y] = toCanvas(point)
    if (index === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  })
  ctx.stroke()
}

function drawGoal(
  ctx: CanvasRenderingContext2D,
  frame: readonly { x: number; y: number }[],
  toCanvas: (p: { x: number; y: number }) => [number, number]
) {
  const [[x1, y1], [x2, y2]] = frame.map(toCanvas)
  const depth = 8
  // La cage s ouvre vers l exterieur du terrain : a gauche pour Nangis,
  // a droite pour Lagny.
  const outward = x1 < ctx.canvas.width / 2 ? -1 : 1
  const backX = x1 + outward * depth

  // Poteau arriere : la cage fermee par trois cotes.
  ctx.strokeStyle = COLORS.goal
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(backX, y1)
  ctx.lineTo(backX, y2)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  // Filet discret.
  ctx.save()
  ctx.strokeStyle = COLORS.goalNet
  ctx.lineWidth = 1
  const minY = Math.min(y1, y2)
  const maxY = Math.max(y1, y2)
  for (let y = minY + 4; y < maxY; y += 5) {
    ctx.beginPath()
    ctx.moveTo(backX, y)
    ctx.lineTo(x1, y)
    ctx.stroke()
  }
  ctx.restore()
}

function drawBall(
  ctx: CanvasRenderingContext2D,
  ball: Ball,
  toCanvas: (p: { x: number; y: number }) => [number, number],
  pxm: number
) {
  const [x, y] = toCanvas(ball.position)
  const radius = Math.max(3.5, BALL_RADIUS * pxm * 0.55)

  ctx.save()
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)'
  ctx.beginPath()
  ctx.ellipse(x + 2, y + 3, radius, radius * 0.7, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = COLORS.ball
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.55)'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(x, y, radius * 0.45, 0, Math.PI * 2)
  ctx.stroke()
  ctx.restore()
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  selected: boolean,
  toCanvas: (p: { x: number; y: number }) => [number, number],
  pxm: number
) {
  const [x, y] = toCanvas(player.position)
  const radius = PLAYER_RADIUS * pxm

  ctx.save()

  // Ombre du jeton : une ellipse au sol, jamais une silhouette.
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
  ctx.beginPath()
  ctx.ellipse(x + 2, y + 3.5, radius * 0.95, radius * 0.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Porteur : anneau blanc.
  if (player.hasBall) {
    ctx.strokeStyle = '#f8fafc'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(x, y, radius + 3, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Selection : anneau clair.
  if (selected) {
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = SELECTION_RING_WIDTH
    ctx.beginPath()
    ctx.arc(x, y, radius + 5.5, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Corps du jeton.
  const gradient = ctx.createRadialGradient(x - radius * 0.3, y - radius * 0.4, radius * 0.2, x, y, radius)
  gradient.addColorStop(0, teamLightColor(player.team))
  gradient.addColorStop(1, teamColor(player.team))
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)'
  ctx.lineWidth = 1
  ctx.stroke()

  // Numero, seule information portee par le jeton.
  ctx.fillStyle = '#f8fafc'
  ctx.font = `700 ${Math.max(10, radius * 0.9)}px 'Segoe UI', system-ui, sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(String(player.number), x, y + 0.5)

  ctx.restore()
}