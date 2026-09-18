import type { MatchState, PlayerState, TeamId, Vector2 } from './types.js';

export type TacticalZone = 'wing-left' | 'back-left' | 'half-left' | 'center' | 'half-right' | 'back-right' | 'wing-right' | 'pivot';

export interface IntervalObservation {
  id: '1-2' | '2-3' | '3-2' | '2-1';
  openness: number;
  defenders: string[];
  reason: string;
  // Point geometrique de l'intervalle sur le terrain (memo spatial).
  point: Vector2;
}

function attackingDirection(team: TeamId): number {
  return team === 'nangis' ? 1 : -1;
}

export function tacticalZone(position: Vector2, team: TeamId): TacticalZone {
  const attackX = team === 'nangis' ? position.x : 40 - position.x;
  if (position.y < 4) return 'wing-left';
  if (position.y > 16) return 'wing-right';
  if (attackX < 8) return 'center';
  if (attackX < 15) return position.y < 10 ? 'back-left' : 'back-right';
  if (attackX < 24) return position.y < 10 ? 'half-left' : 'half-right';
  return position.y < 10 ? 'half-left' : 'half-right';
}

function intervalPosition(id: IntervalObservation['id'], team: TeamId): Vector2 {
  const direction = attackingDirection(team);
  const x = team === 'nangis' ? 29 : 11;
  const y = id === '1-2' || id === '2-1' ? 7 : 13;
  return { x: x + direction * (id === '2-3' || id === '3-2' ? 2 : 0), y };
}

export function observeIntervals(state: MatchState, attackingTeam: TeamId): IntervalObservation[] {
  const defenders = Object.values(state.players).filter((player) => player.team !== attackingTeam && player.isOnCourt && player.role !== 'goalkeeper');
  return (['1-2', '2-3', '3-2', '2-1'] as const).map((id) => {
    const point = intervalPosition(id, attackingTeam);
    const nearby = defenders
      .map((defender) => ({ defender, distance: Math.hypot(defender.position.x - point.x, defender.position.y - point.y) }))
      .sort((first, second) => first.distance - second.distance)
      .slice(0, 2);
    const coverage = nearby.reduce((total, item) => total + Math.max(0, 1 - item.distance / 12), 0);
    const openness = Math.max(0, Math.min(1, 1 - coverage / 2));
    return {
      id,
      openness,
      defenders: nearby.map((item) => item.defender.id),
      reason: openness > 0.65 ? 'space available' : openness > 0.35 ? 'help possible' : 'compact coverage',
      point
    };
  });
}

export function nearestDefender(state: MatchState, playerId: string): string | undefined {
  const player = state.players[playerId];
  if (!player) return undefined;
  return Object.values(state.players)
    .filter((candidate) => candidate.team !== player.team && candidate.isOnCourt && candidate.role !== 'goalkeeper')
    .sort((first, second) => Math.hypot(first.position.x - player.position.x, first.position.y - player.position.y) - Math.hypot(second.position.x - player.position.x, second.position.y - player.position.y))[0]?.id;
}

export interface LaneContest {
  // 0 : ligne libre. 1 : un defenseur est sur la ligne.
  value: number;
  distance: number;
  defenderId?: string;
}

function distanceToSegment(point: Vector2, from: Vector2, to: Vector2): number {
  const segmentX = to.x - from.x;
  const segmentY = to.y - from.y;
  const lengthSquared = segmentX * segmentX + segmentY * segmentY;
  if (lengthSquared === 0) {
    return Math.hypot(point.x - from.x, point.y - from.y);
  }
  const projection = ((point.x - from.x) * segmentX + (point.y - from.y) * segmentY) / lengthSquared;
  const clamped = Math.max(0, Math.min(1, projection));
  return Math.hypot(point.x - (from.x + clamped * segmentX), point.y - (from.y + clamped * segmentY));
}

// Lecture de la ligne de passe : un defenseur proche du trajet ferme la ligne.
// C est ce qui empeche une passe d etre automatique et ce qui donne un sens au bloc.
export function passLaneContest(state: MatchState, passingTeam: TeamId, from: Vector2, to: Vector2): LaneContest {
  const defenders = Object.values(state.players).filter(
    (player) => player.team !== passingTeam && player.isOnCourt && player.role !== 'goalkeeper'
  );
  let best: LaneContest = { value: 0, distance: Number.POSITIVE_INFINITY };
  for (const defender of defenders) {
    const distance = distanceToSegment(defender.position, from, to);
    if (distance < best.distance) {
      best = { value: 0, distance, defenderId: defender.id };
    }
  }
  // 1,2 m ou moins : ligne fermee. 3,5 m ou plus : ligne libre.
  const value = Math.max(0, Math.min(1, (3.5 - best.distance) / 2.3));
  return {
    value,
    distance: best.distance,
    ...(best.defenderId ? { defenderId: best.defenderId } : {})
  };
}

// Locomotion (D-019) : la vitesse effective depend de l'acceleration brute et
// de la fatigue. C'est la seule source de verite des temps d'acces : le
// volley.ts et les fenetres ne recalculent jamais une vitesse a part.
export function locomotionSpeed(player: PlayerState): number {
  const base = 3.2 + (player.acceleration / 100) * 2.3;
  const fatigue = 0.55 + (player.energy / 100) * 0.45;
  return base * fatigue;
}

export interface GapObservation {
  id: string;
  defenders: [string, string];
  // Milieu de l'intervalle entre les deux defenseurs adjacents.
  point: Vector2;
  // Largeur de l'intervalle, en metres.
  width: number;
  // Temps (secondes) pour que le meilleur attaquant atteigne le point.
  attackerAccess: number;
  // Temps (secondes) pour que le defenseur le plus proche referme.
  defenderAccess: number;
  // Fenetre = fermeture defenseur moins acces attaquant. Positive : l'attaque
  // arrive avant. C'est la grandeur fondamentale du jeu (spec 19 §5).
  window: number;
  exploitable: boolean;
}

// Intervalles dynamiques (D-019, spec 19 §5) : les gaps sont calcules entre
// PAIRES de defenseurs adjacents reeles (tries lateralement), pas entre zones
// nommees fixes. La fenetre est temporelle, pas seulement largeur.
export function observeDynamicGaps(state: MatchState, attackingTeam: TeamId): GapObservation[] {
  const defenders = Object.values(state.players)
    .filter((player) => player.team !== attackingTeam && player.isOnCourt && player.role !== 'goalkeeper')
    .sort((first, second) => first.position.y - second.position.y);
  const attackers = Object.values(state.players)
    .filter((player) => player.team === attackingTeam && player.isOnCourt && player.role !== 'goalkeeper');
  const gaps: GapObservation[] = [];
  for (let index = 0; index < defenders.length - 1; index += 1) {
    const left = defenders[index]!;
    const right = defenders[index + 1]!;
    const point = {
      x: (left.position.x + right.position.x) / 2,
      y: (left.position.y + right.position.y) / 2
    };
    const width = Math.hypot(left.position.x - right.position.x, left.position.y - right.position.y);
    const attackerAccess = Math.min(
      ...attackers.map((attacker) => Math.hypot(attacker.position.x - point.x, attacker.position.y - point.y) / locomotionSpeed(attacker) + 0.35)
    );
    const defenderAccess = Math.min(
      Math.hypot(left.position.x - point.x, left.position.y - point.y) / locomotionSpeed(left) + 0.25,
      Math.hypot(right.position.x - point.x, right.position.y - point.y) / locomotionSpeed(right) + 0.25
    );
    const window = defenderAccess - attackerAccess;
    gaps.push({
      id: `gap-${left.id}-${right.id}`,
      defenders: [left.id, right.id],
      point,
      width,
      attackerAccess,
      defenderAccess,
      window,
      exploitable: window >= 0.25 && width >= 1.6
    });
  }
  return gaps;
}

