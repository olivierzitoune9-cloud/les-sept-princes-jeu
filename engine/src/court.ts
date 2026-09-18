import type { TeamId, Vector2 } from './types.js';

// Geometrie officielle du terrain, en metres.
// Modele : x = longueur (0 a 40), y = largeur (0 a 20).
// Les buts sont donc sur l axe x, aux extremites. C est la seule source de verite spatiale.
export const COURT_LENGTH = 40;
export const COURT_WIDTH = 20;
export const GOAL_WIDTH = 3;
export const GOAL_DEPTH = 0.9;
export const GOAL_AREA_RADIUS = 6;
export const FREE_THROW_RADIUS = 9;
export const PENALTY_DISTANCE = 7;
export const GOALKEEPER_LINE_DISTANCE = 4;
export const SUBSTITUTION_ZONE_HALF_LENGTH = 4.5;
export const CENTRE: Vector2 = { x: COURT_LENGTH / 2, y: COURT_WIDTH / 2 };

// Nangis attaque vers x = 40 et defend le but x = 0. Lagny l inverse.
export function attackingDirection(team: TeamId): number {
  return team === 'nangis' ? 1 : -1;
}

export function defendedGoalX(team: TeamId): number {
  return team === 'nangis' ? 0 : COURT_LENGTH;
}

export function attackedGoalX(team: TeamId): number {
  return team === 'nangis' ? COURT_LENGTH : 0;
}

// Distance de tir : c est la seule definition de la portee, l interface ne la recalcule pas.
export function distanceToGoal(position: Vector2, team: TeamId): number {
  return Math.abs(attackedGoalX(team) - position.x);
}

// Angle de tir vu du but : 0 = plein axe, grandit vers les ailes.
// Un tir d'aile a angle ferme vaut moins qu'un tir plein centre a meme
// distance sur l'axe x (docs 01 §29-35, 03 §1, 13 S48-13). Le gardien couvre
// d'autant mieux que l'angle est ferme.
export function shotAngle(position: Vector2): number {
  // But de 3 m centre sur y = 10 : mi-largeur 1,5 m.
  const lateral = Math.abs(position.y - 10);
  const opening = Math.max(0, lateral - 1.5);
  return Math.atan2(opening, 6);
}

// Contexte de tir complet : distance axiale + penalite d'angle exprimee en
// metres equivalents, pour garder une formule lisible et testable.
// A 6 m plein axe : ~0. A l'aile (y=1,5) : ~4-5 m equivalents.
export function shotContext(position: Vector2, team: TeamId): { distance: number; angle: number; effectiveDistance: number } {
  const distance = distanceToGoal(position, team);
  const angle = shotAngle(position);
  // L'angle pese d'autant plus qu'on est pres du but : a 6 m l'aile est
  // presque injouable sans extension, a 12 m l'arriere garde son angle.
  const closeness = Math.max(0, 1 - distance / 18);
  const anglePenalty = angle * (4 + 10 * closeness);
  return { distance, angle, effectiveDistance: distance + anglePenalty };
}

export function goalPostLateral(): [number, number] {
  return [CENTRE.y - GOAL_WIDTH / 2, CENTRE.y + GOAL_WIDTH / 2];
}

// Cage : rectangle 3 par 0.9 dessine derriere la ligne de but, donc visible hors du terrain.
export function goalFrame(team: TeamId): [Vector2, Vector2, Vector2, Vector2] {
  const goalX = defendedGoalX(team);
  const direction = attackingDirection(team);
  const [top, bottom] = goalPostLateral();
  const back = goalX - direction * GOAL_DEPTH;
  return [
    { x: goalX, y: top },
    { x: back, y: top },
    { x: back, y: bottom },
    { x: goalX, y: bottom }
  ];
}

interface ArcRequest {
  centre: Vector2;
  radius: number;
  // Le sens de parcours est porte par la difference entre fromAngle et toAngle.
  fromAngle: number;
  toAngle: number;
  steps?: number;
}

export function arcPoints(request: ArcRequest): Vector2[] {
  const steps = request.steps ?? 24;
  const points: Vector2[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const ratio = index / steps;
    const angle = request.fromAngle + (request.toAngle - request.fromAngle) * ratio;
    points.push({
      x: request.centre.x + Math.cos(angle) * request.radius,
      y: request.centre.y + Math.sin(angle) * request.radius
    });
  }
  return points;
}

// Ligne de zone des 6 m : deux quarts de cercle centres sur les poteaux,
// relies par un segment de 3 m parallele a la ligne de but.
export function goalAreaLine(team: TeamId): Vector2[] {
  return goalEnclosureLine(team, GOAL_AREA_RADIUS);
}

// Ligne des 9 m : meme construction, tiretee, et coupee aux lignes de touche
// comme sur un vrai terrain.
export function freeThrowLine(team: TeamId): Vector2[] {
  return goalEnclosureLine(team, FREE_THROW_RADIUS);
}

function goalEnclosureLine(team: TeamId, radius: number): Vector2[] {
  const goalX = defendedGoalX(team);
  const direction = attackingDirection(team);
  const [top, bottom] = goalPostLateral();
  const depth = goalX + direction * radius;
  const insideTop = 8.5 - radius >= 0;
  const insideBottom = 11.5 + radius <= COURT_WIDTH;
  // Pour le but de droite, l arc doit balayer vers l interieur du terrain :
  // les angles sont donc symetrises par rapport a l axe des ordonnees.
  const startAngle = insideTop
    ? -Math.PI / 2
    : direction > 0
      ? -Math.asin(8.5 / radius)
      : -Math.PI + Math.asin(8.5 / radius);
  const endAngle = insideBottom
    ? Math.PI / 2
    : direction > 0
      ? Math.asin(8.5 / radius)
      : Math.PI - Math.asin(8.5 / radius);
  const points: Vector2[] = [];
  if (!insideTop) {
    points.push({ x: goalX + direction * Math.sqrt(radius * radius - 8.5 * 8.5), y: 0 });
  }
  const topArc = arcPoints({
    centre: { x: goalX, y: top },
    radius,
    fromAngle: startAngle,
    toAngle: direction > 0 ? 0 : -Math.PI
  });
  points.push(...topArc);
  points.push({ x: depth, y: top }, { x: depth, y: bottom });
  const bottomArc = arcPoints({
    centre: { x: goalX, y: bottom },
    radius,
    fromAngle: direction > 0 ? 0 : Math.PI,
    toAngle: endAngle
  });
  points.push(...bottomArc);
  if (!insideBottom) {
    points.push({ x: goalX + direction * Math.sqrt(radius * radius - 8.5 * 8.5), y: COURT_WIDTH });
  }
  return points;
}

// Ligne des 7 m : trait de 1 m parallele a la ligne de but.
export function penaltyLine(team: TeamId): [Vector2, Vector2] {
  const goalX = defendedGoalX(team);
  const x = goalX + attackingDirection(team) * PENALTY_DISTANCE;
  return [
    { x, y: CENTRE.y - 0.5 },
    { x, y: CENTRE.y + 0.5 }
  ];
}

// Ligne de limitation du gardien, a 4 m de la ligne de but.
export function goalkeeperLine(team: TeamId): [Vector2, Vector2] {
  const goalX = defendedGoalX(team);
  const x = goalX + attackingDirection(team) * GOALKEEPER_LINE_DISTANCE;
  return [
    { x, y: CENTRE.y - 0.5 },
    { x, y: CENTRE.y + 0.5 }
  ];
}

// Zone de changement : de part et d autre de la ligne mediane, cote banc.
export function substitutionZone(): [Vector2, Vector2] {
  return [
    { x: CENTRE.x - SUBSTITUTION_ZONE_HALF_LENGTH, y: 0 },
    { x: CENTRE.x + SUBSTITUTION_ZONE_HALF_LENGTH, y: 0 }
  ];
}

export function centreLine(): [Vector2, Vector2] {
  return [
    { x: CENTRE.x, y: 0 },
    { x: CENTRE.x, y: COURT_WIDTH }
  ];
}

export function insideCourt(point: Vector2, margin = 0): boolean {
  return (
    point.x >= -margin &&
    point.x <= COURT_LENGTH + margin &&
    point.y >= -margin &&
    point.y <= COURT_WIDTH + margin
  );
}