import type { DefensiveSystem, MatchEvent, MatchState, TeamId } from './types.js';

function cloneState(state: MatchState): MatchState {
  return structuredClone(state);
}

function appendEvent(state: MatchState, event: Omit<MatchEvent, 'id'>): MatchEvent {
  const completeEvent = { ...event, id: state.events.length + 1 };
  state.events.push(completeEvent);
  state.memory.recentEvents = [...state.memory.recentEvents.slice(-7), `${completeEvent.type}:${completeEvent.result}`];
  return completeEvent;
}

export function changeSystem(state: MatchState, team: TeamId, system: DefensiveSystem): MatchState {
  const nextState = cloneState(state);
  const teamState = nextState.teams[team];
  if (!teamState) {
    throw new Error(`Unknown team ${team}`);
  }
  teamState.system = system;
  appendEvent(nextState, {
    timeSeconds: nextState.timeSeconds,
    type: 'system-change',
    result: `${team}:${system}`,
    causes: ['coach decision', 'current match situation']
  });
  return nextState;
}

export function callTimeout(state: MatchState, team: TeamId): MatchState {
  const nextState = cloneState(state);
  const teamState = nextState.teams[team];
  if (!teamState) {
    throw new Error(`Unknown team ${team}`);
  }
  if (teamState.timeouts <= 0) {
    throw new Error(`${team} has no timeout remaining`);
  }
  teamState.timeouts -= 1;
  appendEvent(nextState, {
    timeSeconds: nextState.timeSeconds,
    type: 'timeout',
    result: team,
    causes: ['coach decision', 'break the current sequence']
  });
  return nextState;
}

export function substitute(state: MatchState, team: TeamId, leavingId: string, enteringId: string): MatchState {
  const nextState = cloneState(state);
  const leaving = nextState.players[leavingId];
  const entering = nextState.players[enteringId];
  if (!leaving || !entering || leaving.team !== team || entering.team !== team) {
    throw new Error('Substitution players must belong to the selected team');
  }
  if (!leaving.isOnCourt || entering.isOnCourt) {
    throw new Error('Substitution requires one court player and one bench player');
  }
  leaving.isOnCourt = false;
  entering.isOnCourt = true;
  entering.position = { ...leaving.position };
  appendEvent(nextState, {
    timeSeconds: nextState.timeSeconds,
    type: 'substitution',
    actorId: enteringId,
    targetId: leavingId,
    result: 'completed',
    causes: ['coach decision', 'fatigue or tactical adjustment']
  });
  return nextState;
}

export function setSevenPlayer(state: MatchState, team: TeamId, enabled: boolean): MatchState {
  const nextState = cloneState(state);
  const goalkeeper = Object.values(nextState.players).find((player) => player.team === team && player.role === 'goalkeeper');
  if (!goalkeeper) {
    throw new Error(`No goalkeeper for ${team}`);
  }
  nextState.teams[team].sevenPlayer = enabled;
  appendEvent(nextState, {
    timeSeconds: nextState.timeSeconds,
    type: 'seven-player',
    actorId: goalkeeper.id,
    result: enabled ? 'enabled' : 'disabled',
    causes: ['numerical superiority', 'empty-goal risk']
  });
  return nextState;
}