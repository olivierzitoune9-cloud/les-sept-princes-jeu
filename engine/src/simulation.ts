import { SeededRandom } from './random.js';
import { createPilotMatch } from './match.js';
import { chooseNextAction } from './ai.js';
import { adaptDefense } from './defense.js';
import { installPossession, playAction, type RestartKind } from './possession.js';
import type { MatchEvent, MatchState, TeamId } from './types.js';

export interface PossessionResult {
  state: MatchState;
  eventIds: number[];
  outcome: 'goal' | 'turnover' | 'save' | 'foul' | 'limit';
}

export interface MatchReport {
  score: Record<TeamId, number>;
  eventCount: number;
  goals: number;
  saves: number;
  turnovers: number;
  fouls: number;
  systems: Record<TeamId, string>;
  patterns: Record<string, number>;
}

export interface MatchRun {
  state: MatchState;
  possessions: PossessionResult[];
  report: MatchReport;
}

export function simulatePossession(initialState: MatchState, team: TeamId, maxActions = 8): PossessionResult {
  // Une possession commence par une installation : l attaque se replace en
  // transition, la defense reprend le dispositif de son moment.
  const currentHolder = initialState.players[initialState.ball.holderId];
  const restart: RestartKind = currentHolder && currentHolder.team === team ? 'interception' : 'centre';
  let state = installPossession(initialState, team, restart);
  const random = new SeededRandom(state.seed + state.events.length * 31 + state.timeSeconds);
  const eventIds: number[] = [];
  for (let actionCount = 0; actionCount < maxActions; actionCount += 1) {
    const decision = chooseNextAction(state, team, random, actionCount);
    if (!decision) {
      return { state, eventIds, outcome: 'turnover' };
    }
    const played = playAction(state, decision.action, random);
    state = played.state;
    eventIds.push(played.event.id);
    if (played.event.result === 'goal') {
      return { state, eventIds, outcome: 'goal' };
    }
    if (played.event.result === 'save') {
      return { state, eventIds, outcome: 'save' };
    }
    if (played.event.result === 'intercepted') {
      return { state, eventIds, outcome: 'turnover' };
    }
    if (played.event.result === 'foul-defense') {
      return { state, eventIds, outcome: 'foul' };
    }
    if (!state.teams[team].possession) {
      return { state, eventIds, outcome: 'turnover' };
    }
  }
  return { state, eventIds, outcome: 'limit' };
}

export function simulateMatch(seed = 44, maxPossessions = 60): MatchRun {
  let state = installPossession(createPilotMatch(seed), 'nangis', 'centre');
  let team: TeamId = 'nangis';
  const possessions: PossessionResult[] = [];
  for (let possessionIndex = 0; possessionIndex < maxPossessions && state.timeSeconds < 3600; possessionIndex += 1) {
    if (!state.teams[team].possession) {
      team = team === 'nangis' ? 'lagny' : 'nangis';
      state = installPossession(state, team, 'centre');
    }
    const possession = simulatePossession(state, team);
    state = possession.state;
    possessions.push(possession);
    if (possessionIndex > 0 && possessionIndex % 5 === 0) {
      state = adaptDefense(state, 'nangis');
      state = adaptDefense(state, 'lagny');
    }
    team = state.teams.nangis.possession ? 'nangis' : 'lagny';
  }
  return { state, possessions, report: createMatchReport(state) };
}

export function createMatchReport(state: MatchState): MatchReport {
  const counts = (type: MatchEvent['type'], result?: string) => state.events.filter((event) => event.type === type && (!result || event.result === result)).length;
  return {
    score: { nangis: state.teams.nangis.score, lagny: state.teams.lagny.score },
    eventCount: state.events.length,
    goals: counts('shoot', 'goal'),
    saves: counts('shoot', 'save'),
    turnovers: counts('pass', 'intercepted'),
    fouls: counts('duel', 'foul-defense'),
    systems: { nangis: state.teams.nangis.system, lagny: state.teams.lagny.system },
    patterns: Object.fromEntries(Object.entries(state.memory.patterns).map(([key, pattern]) => [key, pattern.occurrences]))
  };
}