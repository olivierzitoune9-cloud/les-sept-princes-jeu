import type { DefensiveSystem, MatchState, TeamId } from './types.js';

function opponentOf(team: TeamId): TeamId {
  return team === 'nangis' ? 'lagny' : 'nangis';
}

function appendEvent(state: MatchState, type: string, result: string, causes: string[]): void {
  state.events.push({ id: state.events.length + 1, timeSeconds: state.timeSeconds, type, result, causes });
}

export function defensivePressure(system: DefensiveSystem, actorRole: string, intention?: string): number {
  if (system === '6-0') {
    return intention === 'attack-inside' ? 10 : actorRole === 'pivot' ? 8 : 2;
  }
  if (system === '1-5') {
    return actorRole === 'center' ? 12 : intention === 'secure' ? 5 : 3;
  }
  if (system === '1-2-3' || system === 'hybrid-1-2-3') {
    return intention === 'hidden' ? 5 : 9;
  }
  return 0;
}

export function recommendedDefense(state: MatchState, defendingTeam: TeamId): DefensiveSystem {
  const attackingTeam = opponentOf(defendingTeam);
  const recent = state.events.slice(-12);
  const attacksByYanis = recent.filter((event) => event.actorId === 'yanis' && ['pass', 'duel', 'fixation'].includes(event.type)).length;
  const goalsByMalone = recent.filter((event) => event.actorId === 'malone' && event.result === 'goal').length;
  if (defendingTeam === 'lagny' && attacksByYanis >= 2) return '1-5';
  if (defendingTeam === 'nangis' && goalsByMalone >= 2) return 'hybrid-1-2-3';
  return state.teams[attackingTeam].system === '1-5' ? '6-0' : state.teams[defendingTeam].system;
}

export function adaptDefense(state: MatchState, defendingTeam: TeamId): MatchState {
  const nextState = structuredClone(state);
  const nextSystem = recommendedDefense(nextState, defendingTeam);
  if (nextState.teams[defendingTeam].system !== nextSystem) {
    nextState.teams[defendingTeam].system = nextSystem;
    appendEvent(nextState, 'defensive-adaptation', `${defendingTeam}:${nextSystem}`, ['recent pattern', 'coach reading', 'counter-adaptation']);
  }
  return nextState;
}
