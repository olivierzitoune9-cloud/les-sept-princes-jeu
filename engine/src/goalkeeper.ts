import type { MatchState, TeamId } from './types.js';

export type ShotType = 'placed' | 'power' | 'lob' | 'roucoulette' | 'chabala';
export type GoalkeeperRead = 'wait' | 'anticipate-high' | 'anticipate-low' | 'advance';

export interface ShotProfile {
  type: ShotType;
  side: 'near' | 'far' | 'center';
  height: 'high' | 'low' | 'middle';
  power: number;
}

export interface GoalkeeperDecision {
  read: GoalkeeperRead;
  confidence: number;
  reason: string;
}

function opponentOf(team: TeamId): TeamId {
  return team === 'nangis' ? 'lagny' : 'nangis';
}

export function chooseGoalkeeperRead(state: MatchState, goalkeeperTeam: TeamId, shooterId: string, shot: ShotProfile): GoalkeeperDecision {
  const goalkeeper = Object.values(state.players).find((player) => player.team === goalkeeperTeam && player.role === 'goalkeeper' && player.isOnCourt);
  const shooter = state.players[shooterId];
  if (!goalkeeper || !shooter) {
    return { read: 'wait', confidence: 0.2, reason: 'insufficient information' };
  }
  const patternKey = `shoot:${shot.type}:${shot.side}`;
  const repetitions = state.memory.patterns[patternKey]?.occurrences ?? 0;
  const confidence = Math.min(0.9, 0.35 + repetitions * 0.1 + goalkeeper.anticipation / 300);
  if (shot.type === 'lob') return { read: 'advance', confidence, reason: 'close the lob angle' };
  if (repetitions >= 2 && shot.height === 'high') return { read: 'anticipate-high', confidence, reason: 'repeated high shot pattern' };
  if (shot.height === 'low') return { read: 'anticipate-low', confidence: confidence - 0.08, reason: 'protect the lower target' };
  return { read: 'wait', confidence, reason: 'preserve reaction time' };
}

export function goalkeeperAdvantage(state: MatchState, goalkeeperTeam: TeamId, shooterId: string, shot: ShotProfile): number {
  const decision = chooseGoalkeeperRead(state, goalkeeperTeam, shooterId, shot);
  const goalkeeper = Object.values(state.players).find((player) => player.team === goalkeeperTeam && player.role === 'goalkeeper' && player.isOnCourt);
  if (!goalkeeper) return 0;
  const readBonus = decision.read === 'wait' ? goalkeeper.goalkeeper * 0.35 : goalkeeper.anticipation * decision.confidence * 0.55;
  const styleBonus = shot.type === 'roucoulette' && decision.read === 'anticipate-high' ? 12 : shot.type === 'lob' && decision.read === 'advance' ? 16 : 0;
  return readBonus + styleBonus;
}

export function mentalSwing(state: MatchState, actorId: string, positive: boolean): MatchState {
  const nextState = structuredClone(state);
  const actor = nextState.players[actorId];
  if (!actor) return nextState;
  actor.confidence = Math.max(0, Math.min(100, actor.confidence + (positive ? 5 : -5)));
  actor.pressure = Math.max(0, Math.min(100, actor.pressure + (positive ? -4 : 6)));
  return nextState;
}

export function goalkeeperOpponent(state: MatchState, shooterTeam: TeamId): TeamId {
  return opponentOf(shooterTeam);
}
