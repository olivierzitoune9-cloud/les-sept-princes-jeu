import type { MatchState, TeamId, Vector2 } from './types.js';

export type TacticalZone = 'wing-left' | 'back-left' | 'half-left' | 'center' | 'half-right' | 'back-right' | 'wing-right' | 'pivot';

export interface IntervalObservation {
  id: '1-2' | '2-3' | '3-2' | '2-1';
  openness: number;
  defenders: string[];
  reason: string;
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
      reason: openness > 0.65 ? 'space available' : openness > 0.35 ? 'help possible' : 'compact coverage'
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
