import { COURT_LENGTH, COURT_WIDTH, GOAL_DEPTH } from '@engine/court.js'

// Constantes d affichage. La geometrie du terrain vient du moteur : l interface
// ne definit ni les buts, ni les zones, ni les distances de tir.
export const COURT_MARGIN = GOAL_DEPTH + 1.1 // place pour la cage et une marge visuelle
export const CANVAS_WIDTH_METRES = COURT_LENGTH + COURT_MARGIN * 2
export const CANVAS_HEIGHT_METRES = COURT_WIDTH + COURT_MARGIN * 2
export const CANVAS_ASPECT = CANVAS_WIDTH_METRES / CANVAS_HEIGHT_METRES

export const PLAYER_RADIUS = 0.78
export const BALL_RADIUS = 0.28
export const SELECTION_RING_WIDTH = 0.14

// Palette v2 (D-021) : logiciel tactique premium. Fond quasi noir bleute,
// terrain profond bleu-ardoise, lignes claires fines, jetons satures a halo,
// or pour la decision. Une couleur garde toujours la meme signification (07 §3).
export const COLORS = {
  backdrop: '#04070d',
  field: '#16283d',
  fieldGradientTop: '#1c3049',
  fieldGradientBottom: '#101f31',
  lines: 'rgba(148, 178, 214, 0.42)',
  linesStrong: 'rgba(214, 230, 248, 0.9)',
  zone6m: 'rgba(120, 170, 226, 0.12)',
  zone6mLine: 'rgba(190, 214, 240, 0.78)',
  zone9m: 'rgba(148, 178, 214, 0.5)',
  nangis: '#2f7fe0',
  nangisLight: '#8ec4ff',
  nangisSoft: 'rgba(47, 127, 224, 0.22)',
  lagny: '#e2693a',
  lagnyLight: '#ffb287',
  lagnySoft: 'rgba(226, 105, 58, 0.2)',
  ball: '#fbbf24',
  ballLight: '#fde68a',
  selected: '#34d399',
  text: '#eef2f8',
  textMuted: '#93a4bb',
  goal: '#e7eef8',
  goalNet: 'rgba(231, 238, 248, 0.2)',
  goalGlow: 'rgba(190, 214, 245, 0.12)',
  danger: '#fb923c',
  opportunity: '#34d399',
  decision: '#facc15',
  carrierCone: 'rgba(250, 204, 21, 0.11)',
  carrierConeBorder: 'rgba(250, 204, 21, 0.32)',
  defenderCone: 'rgba(244, 63, 94, 0.14)',
  defenderConeBorder: 'rgba(244, 63, 94, 0.4)',
  intervalZone: 'rgba(16, 185, 129, 0.14)',
  intervalZoneBorder: 'rgba(52, 211, 153, 0.45)'
}

// Zone du canvas : le terrain est entoure d une marge qui contient les cages.
export function courtToCanvas(x: number, y: number, scale: number): [number, number] {
  return [(x + COURT_MARGIN) * scale, (y + COURT_MARGIN) * scale]
}

export function canvasToCourt(x: number, y: number, scale: number): [number, number] {
  return [x / scale - COURT_MARGIN, y / scale - COURT_MARGIN]
}

export function teamColor(team: 'nangis' | 'lagny'): string {
  return team === 'nangis' ? COLORS.nangis : COLORS.lagny
}

export function teamLightColor(team: 'nangis' | 'lagny'): string {
  return team === 'nangis' ? COLORS.nangisLight : COLORS.lagnyLight
}

export function teamSoftColor(team: 'nangis' | 'lagny'): string {
  return team === 'nangis' ? COLORS.nangisSoft : COLORS.lagnySoft
}
