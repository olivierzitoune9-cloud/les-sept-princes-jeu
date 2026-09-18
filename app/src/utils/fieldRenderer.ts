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

export interface TacticalTrajectory {
  id: string
  actionId: string
  type: 'pass' | 'shoot' | 'duel' | 'fix' | 'cross' | 'run'
  from: { x: number; y: number }
  to: { x: number; y: number }
  risk?: 'safe' | 'moderate' | 'risky'
  label: string
  targetPlayerId?: string
}

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

// Intervalles ouverts calcules par le moteur (memo spatial) : le handball est
// un sport d'espaces et d'intervalles (docs 01 §5, 04, 05 §5, 07 §2), le
// terrain doit montrer ou l'espace vit, avec une variation discrete de teinte.
export interface OpenIntervalMarker {
  id: string
  point: { x: number; y: number }
  openness: number
}

// Rendu du terrain : la geometrie vient integralement du moteur. L interface
// ne recalcule ni les zones, ni les buts, ni les distances de tir.
export function drawField(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  ball: Ball,
  selectedPlayerId: string | null,
  pxm: number,
  trajectories: TacticalTrajectory[] = [],
  hoveredActionId: string | null = null,
  openIntervals: OpenIntervalMarker[] = []
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

  // Intervalles ouverts du moment (memo spatial du moteur) : halo discrete
  // sous les jetons, uniquement quand l'espace est vraiment vivant.
  for (const interval of openIntervals) {
    const [x, y] = toCanvas(interval.point)
    const strength = Math.max(0.15, Math.min(1, (interval.openness - 0.35) / 0.65))
    const radius = Math.max(14, 4.2 * pxm)
    const gradient = ctx.createRadialGradient(x, y, 2, x, y, radius)
    gradient.addColorStop(0, `rgba(94, 234, 212, ${0.16 * strength})`)
    gradient.addColorStop(1, 'rgba(94, 234, 212, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    if (strength >= 0.55) {
      ctx.strokeStyle = `rgba(94, 234, 212, ${0.28 * strength})`
      ctx.lineWidth = 1
      ctx.setLineDash([3, 4])
      ctx.beginPath()
      ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])
    }
  }

  // Cages.
  for (const team of ['nangis', 'lagny'] as const) {
    drawGoal(ctx, goalFrame(team), toCanvas)
  }

  // Zones tactiques aux 9 mètres (Doc 05 - Section 5 : Aile G, 1-2, 2-3, Centre, 3-2, 2-1, Aile D)
  drawTacticalZones(ctx, players, toCanvas, pxm)

  // Cônes d'influence tactique (cône de passe jaune, contestation rouge, intervalle vert)
  drawTacticalCones(ctx, players, toCanvas, pxm)

  // Trajectoires tactiques (passes, tirs, duels) sous les jetons.
  drawTacticalTrajectories(ctx, trajectories, toCanvas, hoveredActionId, pxm)

  // Ballon puis jetons.
  drawBall(ctx, ball, toCanvas, pxm)

  const passTargetIds = new Set(
    trajectories.filter((t) => t.type === 'pass' && t.targetPlayerId).map((t) => t.targetPlayerId)
  )
  const duelTargetIds = new Set(
    trajectories.filter((t) => (t.type === 'duel' || t.type === 'fix') && t.targetPlayerId).map((t) => t.targetPlayerId)
  )

  players.forEach((player) => {
    drawPlayer(
      ctx,
      player,
      player.id === selectedPlayerId,
      passTargetIds.has(player.id),
      duelTargetIds.has(player.id),
      toCanvas,
      pxm
    )
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

// Zones tactiques selon Doc 05 - Section 5 :
// AILE G  1-2  2-3  CENTRE  3-2  2-1  AILE D
function drawTacticalZones(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  toCanvas: (p: { x: number; y: number }) => [number, number],
  pxm: number
) {
  const ZONES = [
    { label: 'AILE G', minY: 0, maxY: 3.6, center: 1.8 },
    { label: '1-2', minY: 3.6, maxY: 6.8, center: 5.2 },
    { label: '2-3', minY: 6.8, maxY: 9.2, center: 8.0 },
    { label: 'CENTRE', minY: 9.2, maxY: 10.8, center: 10.0 },
    { label: '3-2', minY: 10.8, maxY: 13.2, center: 12.0 },
    { label: '2-1', minY: 13.2, maxY: 16.4, center: 14.8 },
    { label: 'AILE D', minY: 16.4, maxY: 20, center: 18.2 }
  ]

  const carrier = players.find((p) => p.hasBall)
  // Lagny's 9m line around x = 29.5 (attacked by Nangis)
  // Nangis' 9m line around x = 10.5 (attacked by Lagny)
  const sides = [
    { xZone: 29.2, isCarrierSide: carrier ? carrier.position.x >= 20 : true },
    { xZone: 10.8, isCarrierSide: carrier ? carrier.position.x < 20 : false }
  ]

  ctx.save()
  sides.forEach(({ xZone, isCarrierSide }) => {
    ZONES.forEach((zone) => {
      const isCurrentZone =
        isCarrierSide &&
        carrier &&
        carrier.position.y >= zone.minY &&
        carrier.position.y < zone.maxY
      const [cx, cy] = toCanvas({ x: xZone, y: zone.center })

      ctx.font = isCurrentZone
        ? `700 ${Math.max(9, 0.42 * pxm)}px 'Segoe UI', system-ui, sans-serif`
        : `600 ${Math.max(7.5, 0.35 * pxm)}px 'Segoe UI', system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = isCurrentZone
        ? 'rgba(250, 204, 21, 0.95)'
        : 'rgba(148, 163, 184, 0.35)'
      ctx.fillText(zone.label, cx, cy)

      if (isCurrentZone) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.7)'
        ctx.beginPath()
        ctx.arc(cx, cy + Math.max(7, 0.35 * pxm), 2.5, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  })
  ctx.restore()
}

function drawTacticalCones(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  toCanvas: (p: { x: number; y: number }) => [number, number],
  pxm: number
) {
  const carrier = players.find((p) => p.hasBall)
  if (!carrier) return

  const isNangis = carrier.team === 'nangis'
  const [carrierX, carrierY] = toCanvas(carrier.position)

  // 1. Cône de vision / passe du porteur
  // Nangis attaque vers la droite (angle 0), Lagny attaque vers la gauche (angle Math.PI)
  ctx.save()
  const visionAngle = isNangis ? 0 : Math.PI
  const visionSpread = Math.PI / 3 // 60 degrés
  const visionRadius = 10 * pxm

  ctx.fillStyle = isNangis ? COLORS.carrierCone : 'rgba(239, 68, 68, 0.15)'
  ctx.beginPath()
  ctx.moveTo(carrierX, carrierY)
  ctx.arc(carrierX, carrierY, visionRadius, visionAngle - visionSpread / 2, visionAngle + visionSpread / 2)
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = isNangis ? COLORS.carrierConeBorder : 'rgba(239, 68, 68, 0.35)'
  ctx.lineWidth = 1.2
  ctx.setLineDash([4, 4])
  ctx.stroke()
  ctx.setLineDash([])
  ctx.restore()

  // 2. Cône de contestation du défenseur le plus proche
  const defendingTeam = isNangis ? 'lagny' : 'nangis'
  const opponents = players.filter((p) => p.team === defendingTeam)
  let closestOpponent: Player | null = null
  let minDist = Infinity
  for (const opp of opponents) {
    const d = Math.hypot(opp.position.x - carrier.position.x, opp.position.y - carrier.position.y)
    if (d < minDist && d < 7.5) {
      minDist = d
      closestOpponent = opp
    }
  }

  if (closestOpponent) {
    const [oppX, oppY] = toCanvas(closestOpponent.position)
    const angleToCarrier = Math.atan2(carrierY - oppY, carrierX - oppX)
    const contestSpread = Math.PI / 3.2
    const contestRadius = Math.min(minDist * pxm + 12, 6 * pxm)

    ctx.save()
    ctx.fillStyle = isNangis ? COLORS.defenderCone : 'rgba(59, 130, 246, 0.18)'
    ctx.beginPath()
    ctx.moveTo(oppX, oppY)
    ctx.arc(oppX, oppY, contestRadius, angleToCarrier - contestSpread / 2, angleToCarrier + contestSpread / 2)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = isNangis ? COLORS.defenderConeBorder : 'rgba(59, 130, 246, 0.45)'
    ctx.lineWidth = 1.2
    ctx.setLineDash([3, 3])
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  // 3. Zone d'intervalle libre (couloir vert doux entre deux défenseurs)
  if (isNangis && carrier.position.x >= 18 && carrier.position.x <= 34) {
    const sortedDefenders = opponents
      .map((opp) => ({ opp, d: Math.hypot(opp.position.x - carrier.position.x, opp.position.y - carrier.position.y) }))
      .sort((a, b) => a.d - b.d)

    if (sortedDefenders.length >= 2) {
      const d1 = sortedDefenders[0].opp
      const d2 = sortedDefenders[1].opp
      const defDist = Math.hypot(d1.position.x - d2.position.x, d1.position.y - d2.position.y)
      if (defDist >= 2.5 && defDist <= 8.5) {
        const [x1, y1] = toCanvas(d1.position)
        const [x2, y2] = toCanvas(d2.position)
        const [targetX, targetY] = toCanvas({ x: Math.min(38, carrier.position.x + 8), y: (d1.position.y + d2.position.y) / 2 })

        ctx.save()
        ctx.fillStyle = COLORS.intervalZone
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(targetX, targetY - 14)
        ctx.lineTo(targetX, targetY + 14)
        ctx.lineTo(x2, y2)
        ctx.closePath()
        ctx.fill()

        ctx.strokeStyle = COLORS.intervalZoneBorder
        ctx.lineWidth = 1
        ctx.setLineDash([5, 5])
        ctx.stroke()
        ctx.setLineDash([])
        ctx.restore()
      }
    }
  }
}

function drawTacticalTrajectories(
  ctx: CanvasRenderingContext2D,
  trajectories: TacticalTrajectory[],
  toCanvas: (p: { x: number; y: number }) => [number, number],
  hoveredActionId: string | null,
  pxm: number
) {
  if (!trajectories || trajectories.length === 0) return

  ctx.save()

  // Cones de tir
  trajectories.filter((t) => t.type === 'shoot').forEach((traj) => {
    const isHovered = traj.actionId === hoveredActionId
    const [fromX, fromY] = toCanvas(traj.from)
    const [topGoalX, topGoalY] = toCanvas({ x: 40, y: 8.5 })
    const [botGoalX, botGoalY] = toCanvas({ x: 40, y: 11.5 })
    const [centerGoalX, centerGoalY] = toCanvas({ x: 40, y: 10 })

    ctx.fillStyle = isHovered ? 'rgba(251, 191, 36, 0.24)' : 'rgba(251, 191, 36, 0.08)'
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(topGoalX, topGoalY)
    ctx.lineTo(botGoalX, botGoalY)
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = isHovered ? '#fbbf24' : 'rgba(251, 191, 36, 0.75)'
    ctx.lineWidth = isHovered ? 3 : 1.8
    ctx.setLineDash([8, 4])
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(centerGoalX, centerGoalY)
    ctx.stroke()
    ctx.setLineDash([])

    drawArrowHead(ctx, fromX, fromY, centerGoalX - 8, centerGoalY, isHovered ? '#fbbf24' : 'rgba(251, 191, 36, 0.85)', isHovered ? 9 : 7)
  })

  // Lignes de passe
  trajectories.filter((t) => t.type === 'pass').forEach((traj) => {
    const isHovered = traj.actionId === hoveredActionId
    const [fromX, fromY] = toCanvas(traj.from)
    const [toX, toY] = toCanvas(traj.to)

    const color = traj.risk === 'safe'
      ? (isHovered ? '#34d399' : 'rgba(52, 211, 153, 0.75)')
      : traj.risk === 'risky'
      ? (isHovered ? '#f87171' : 'rgba(248, 113, 113, 0.75)')
      : (isHovered ? '#fbbf24' : 'rgba(251, 191, 36, 0.75)')

    ctx.strokeStyle = color
    ctx.lineWidth = isHovered ? 3.2 : 1.8
    ctx.setLineDash(isHovered ? [8, 3] : [6, 5])
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    ctx.setLineDash([])

    const angle = Math.atan2(toY - fromY, toX - fromX)
    const dist = Math.hypot(toX - fromX, toY - fromY)
    const offsetDist = Math.max(0, dist - (PLAYER_RADIUS * pxm + 4))
    const arrowX = fromX + Math.cos(angle) * offsetDist
    const arrowY = fromY + Math.sin(angle) * offsetDist
    drawArrowHead(ctx, fromX, fromY, arrowX, arrowY, color, isHovered ? 9 : 7)
  })

  // Duels et fixations
  trajectories.filter((t) => t.type === 'duel' || t.type === 'fix').forEach((traj) => {
    const isHovered = traj.actionId === hoveredActionId
    const [fromX, fromY] = toCanvas(traj.from)
    const [toX, toY] = toCanvas(traj.to)

    const color = isHovered ? '#f43f5e' : 'rgba(244, 63, 94, 0.75)'
    ctx.strokeStyle = color
    ctx.lineWidth = isHovered ? 2.8 : 1.6
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    ctx.lineTo(toX, toY)
    ctx.stroke()
    ctx.setLineDash([])

    const midX = (fromX + toX) / 2
    const midY = (fromY + toY) / 2
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(midX, midY, isHovered ? 4.5 : 3, 0, Math.PI * 2)
    ctx.fill()
  })

  // Courses et croises (P1, preuve trajectoires) : l'intention de mouvement
  // se trace AVANT la decision, comme le trace au stylet d'Inazuma Eleven —
  // le coach voit ou le joueur veut aller, pas seulement ou il est.
  trajectories.filter((t) => t.type === 'run' || t.type === 'cross').forEach((traj) => {
    const isHovered = traj.actionId === hoveredActionId
    const [fromX, fromY] = toCanvas(traj.from)
    const [toX, toY] = toCanvas(traj.to)

    const color = traj.risk === 'risky'
      ? (isHovered ? '#f87171' : 'rgba(248, 113, 113, 0.7)')
      : (isHovered ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)')
    ctx.strokeStyle = color
    ctx.lineWidth = isHovered ? 3 : 1.8
    ctx.setLineDash(isHovered ? [10, 3] : [7, 5])
    ctx.beginPath()
    ctx.moveTo(fromX, fromY)
    // Courbe legere : la trajectoire respire, ce n'est pas un rail.
    const bendX = (fromX + toX) / 2 + (toY - fromY) * 0.12
    const bendY = (fromY + toY) / 2 - (toX - fromX) * 0.12
    ctx.quadraticCurveTo(bendX, bendY, toX, toY)
    ctx.stroke()
    ctx.setLineDash([])

    drawArrowHead(ctx, bendX, bendY, toX, toY, color, isHovered ? 9 : 7)
  })

  ctx.restore()
}

function drawArrowHead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  size: number
) {
  const angle = Math.atan2(toY - fromY, toX - fromX)
  ctx.save()
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(toX, toY)
  ctx.lineTo(
    toX - size * Math.cos(angle - Math.PI / 6),
    toY - size * Math.sin(angle - Math.PI / 6)
  )
  ctx.lineTo(
    toX - size * Math.cos(angle + Math.PI / 6),
    toY - size * Math.sin(angle + Math.PI / 6)
  )
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  selected: boolean,
  isPassTarget: boolean,
  isDuelTarget: boolean,
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

  // Porteur de balle : double anneau or éclatant
  if (player.hasBall) {
    ctx.strokeStyle = '#facc15'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, radius + 4, 0, Math.PI * 2)
    ctx.stroke()

    ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x, y, radius + 7.5, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Cible de passe disponible : anneau discret émeraude
  if (isPassTarget && !player.hasBall) {
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.8)'
    ctx.lineWidth = 2
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.arc(x, y, radius + 4.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Cible de duel : anneau d'affrontement rose/rouge
  if (isDuelTarget) {
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)'
    ctx.lineWidth = 2
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(x, y, radius + 4.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
  }

  // Selection : anneau clair
  if (selected) {
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = Math.max(2, SELECTION_RING_WIDTH * pxm)
    ctx.beginPath()
    ctx.arc(x, y, radius + 6, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Jauge d'énergie / fatigue (Doc 05 - Section 6 : affichage de la fatigue sur le cercle)
  const energy = player.fatigue ?? 100
  if (energy < 92) {
    const energyColor = energy >= 65 ? '#34d399' : energy >= 38 ? '#fbbf24' : '#f87171'
    ctx.strokeStyle = energyColor
    ctx.lineWidth = 2.2
    ctx.beginPath()
    const startAngle = -Math.PI / 2
    const endAngle = startAngle + (Math.PI * 2 * (energy / 100))
    ctx.arc(x, y, radius + 2.4, startAngle, endAngle)
    ctx.stroke()
  }

  // Statut : alerte de pression défensive forte (> 55%)
  const pressure = player.pressure ?? 0
  if (pressure > 55) {
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.65)'
    ctx.lineWidth = 1.8
    ctx.setLineDash([3, 3])
    ctx.beginPath()
    ctx.arc(x, y, radius + 5.5, 0, Math.PI * 2)
    ctx.stroke()
    ctx.setLineDash([])
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

  // Nom du joueur sous le jeton pour lisibilite immediate
  ctx.fillStyle = player.team === 'nangis' ? 'rgba(226, 232, 240, 0.92)' : 'rgba(254, 202, 202, 0.85)'
  ctx.font = `600 ${Math.max(8.5, radius * 0.52)}px 'Segoe UI', system-ui, sans-serif`
  ctx.fillText(player.name, x, y + radius + 8.5)

  ctx.restore()
}