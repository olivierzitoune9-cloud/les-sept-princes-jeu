// Dimensions réglementaires du terrain de handball (en mètres)
export const FIELD_WIDTH = 40
export const FIELD_HEIGHT = 20

// Zones réglementaires
export const GOAL_AREA_RADIUS = 6 // Zone des 6m
export const FREE_THROW_LINE = 9 // Ligne des 9m
export const PENALTY_LINE = 7 // Ligne des 7m
export const GOAL_WIDTH = 3
export const GOAL_HEIGHT = 2

// Échelle pour le canvas (pixels par mètre)
export const SCALE = 20 // 1m = 20px, donc terrain = 800x400px

// Tailles des éléments
export const PLAYER_RADIUS = 0.8 // Rayon du jeton joueur en mètres
export const BALL_RADIUS = 0.3 // Rayon du ballon en mètres
export const SELECTION_RING_WIDTH = 0.15 // Largeur de l'anneau de sélection

// Couleurs (utilise les variables CSS)
export const COLORS = {
  field: '#2a3447',
  lines: '#4a5568',
  zone6m: 'rgba(42, 52, 71, 0.5)',
  zone9m: 'rgba(42, 52, 71, 0.3)',
  nangis: '#3b82f6',
  lagny: '#ef4444',
  ball: '#fbbf24',
  selected: '#10b981',
  text: '#e2e8f0',
  textSecondary: '#94a3b8'
}

// Conversion coordonnées terrain -> canvas
export function fieldToCanvas(x: number, y: number): [number, number] {
  return [x * SCALE, y * SCALE]
}

// Conversion canvas -> terrain
export function canvasToField(x: number, y: number): [number, number] {
  return [x / SCALE, y / SCALE]
}
