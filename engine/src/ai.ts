import { getSituation } from './engine.js';
import { SeededRandom } from './random.js';
import type { ActionIntent, MatchState, TeamId } from './types.js';

export interface DecisionTrace {
  action: ActionIntent;
  reason: string;
  confidence: number;
}

function opponentOf(team: TeamId): TeamId {
  return team === 'nangis' ? 'lagny' : 'nangis';
}

export function chooseNextAction(state: MatchState, team: TeamId, random: SeededRandom, actionCount: number): DecisionTrace | undefined {
  const situation = getSituation(state);
  const holder = state.players[state.ball.holderId];
  if (!holder || holder.team !== team) {
    return undefined;
  }
  const opponentSystem = state.teams[opponentOf(team)].system;
  const shoot = situation.availableActions.find((action) => action.type === 'shoot');
  const duel = situation.availableActions.find((action) => action.type === 'duel');
  const passes = situation.availableActions.filter((action) => action.type === 'pass');
  const interceptedPasses = state.memory.patterns['pass:intercepted']?.occurrences ?? 0;
  const fatiguePressure = holder.energy < 35;

  if (shoot && (actionCount >= 2 || fatiguePressure)) {
    return { action: shoot, reason: fatiguePressure ? 'fatigue pushes a quick conclusion' : 'the situation has matured into a shot', confidence: fatiguePressure ? 0.62 : 0.58 };
  }
  if (duel && opponentSystem === '6-0' && holder.duel + holder.acceleration > 160 && random.chance(0.48)) {
    return { action: duel, reason: 'attack the compact defensive block', confidence: 0.66 };
  }
  if (duel && interceptedPasses >= 2 && random.chance(0.32)) {
    return { action: duel, reason: 'avoid a repeatedly closed passing lane', confidence: 0.71 };
  }
  const selectedPass = passes[Math.floor(random.next() * passes.length)];
  if (selectedPass) {
    return { action: selectedPass, reason: holder.role === 'center' ? 'organize the next situation' : 'preserve the collective structure', confidence: 0.54 };
  }
  return shoot ? { action: shoot, reason: 'no safer continuation is available', confidence: 0.4 } : undefined;
}
