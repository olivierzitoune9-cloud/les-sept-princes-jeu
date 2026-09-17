import { SeededRandom } from './random.js';
import { resolveAction } from './engine.js';
import type { ActionIntent, MatchEvent, MatchState } from './types.js';

export interface SequenceStep {
  action: ActionIntent;
  continueOn?: string[];
}

export interface SequenceResult {
  state: MatchState;
  events: MatchEvent[];
  interrupted: boolean;
  interruptionReason?: string;
}

const interruptingResults = new Set(['contained', 'intercepted', 'save', 'foul-defense']);

export function executeSequence(initialState: MatchState, steps: SequenceStep[], seed = initialState.seed): SequenceResult {
  let state = structuredClone(initialState);
  const random = new SeededRandom(seed + state.events.length);
  const events: MatchEvent[] = [];
  for (const step of steps) {
    const resolution = resolveAction(state, step.action, random);
    state = resolution.state;
    events.push(resolution.event);
    const allowedContinuation = step.continueOn ?? [];
    if (allowedContinuation.length > 0 && !allowedContinuation.includes(resolution.event.result)) {
      return { state, events, interrupted: true, interruptionReason: `unexpected result: ${resolution.event.result}` };
    }
    if (interruptingResults.has(resolution.event.result)) {
      return { state, events, interrupted: true, interruptionReason: resolution.event.result };
    }
  }
  return { state, events, interrupted: false };
}
