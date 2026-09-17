import { describe, expect, it } from 'vitest';
import { createPilotMatch } from './match.js';
import { getSituation, resolveAction, simulatePilotSequence } from './engine.js';
import { chooseNextAction } from './ai.js';
import { callTimeout, changeSystem, setSevenPlayer, substitute } from './coaching.js';
import { createMatchReport, simulateMatch, simulatePossession } from './simulation.js';
import { observeIntervals, tacticalZone } from './spatial.js';
import { executeSequence } from './sequence.js';
import { adaptDefense, recommendedDefense } from './defense.js';
import { chooseGoalkeeperRead } from './goalkeeper.js';
import { runSeedCampaign } from './validation.js';
import { SeededRandom } from './random.js';

describe('pilot match engine', () => {
  it('exposes contextual actions for the current holder', () => {
    const situation = getSituation(createPilotMatch(44));
    expect(situation.state.ball.holderId).toBe('yanis');
    expect(situation.availableActions.some((action) => action.type === 'pass' && action.targetId === 'aaron')).toBe(true);
    expect(situation.availableActions.some((action) => action.type === 'duel')).toBe(true);
    expect(situation.availableActions.some((action) => action.type === 'fix')).toBe(true);
    expect(situation.availableActions.some((action) => action.type === 'cross')).toBe(true);
  });

  it('makes a traceable contextual decision', () => {
    const state = createPilotMatch(44);
    const decision = chooseNextAction(state, 'nangis', new SeededRandom(44), 0);
    expect(decision).toBeDefined();
    expect(decision?.action.actorId).toBe('yanis');
    expect(decision?.reason.length).toBeGreaterThan(0);
    expect(decision?.confidence).toBeGreaterThan(0);
  });

  it('derives tactical zones and changing interval openness from positions', () => {
    const state = createPilotMatch(44);
    const intervals = observeIntervals(state, 'nangis');
    expect(intervals).toHaveLength(4);
    expect(intervals.every((interval) => interval.openness >= 0 && interval.openness <= 1)).toBe(true);
    expect(tacticalZone(state.players.yanis!.position, 'nangis')).toBe('half-right');
    const initialOpen = intervals.map((interval) => interval.openness);
    state.players.mael!.position = { x: 29, y: 7 };
    const shiftedOpen = observeIntervals(state, 'nangis').map((interval) => interval.openness);
    expect(shiftedOpen).not.toEqual(initialOpen);
  });

  it('resolves fixation, block and cross as collective actions', () => {
    const state = createPilotMatch(44);
    const fixation = resolveAction(state, { type: 'fix', actorId: 'yanis', targetId: 'kael' }, new SeededRandom(44));
    expect(fixation.event.result).toBe('attracted');
    expect(fixation.state.players.kael?.pressure).toBeGreaterThan(state.players.kael?.pressure ?? 0);
    const block = resolveAction(fixation.state, { type: 'block', actorId: 'edgar', targetId: 'mael' }, new SeededRandom(45));
    expect(block.event.result).toBe('set');
    const cross = resolveAction(block.state, { type: 'cross', actorId: 'aaron', targetId: 'erwan' }, new SeededRandom(46));
    expect(cross.event.result).toBe('started');
    expect(cross.state.players.erwan?.position.y).not.toBe(block.state.players.erwan?.position.y);
  });

  it('models off-ball runs, marking and defensive help', () => {
    const state = createPilotMatch(44);
    const run = resolveAction(state, { type: 'run', actorId: 'yanis', targetPosition: { x: 30, y: 15 } }, new SeededRandom(47));
    expect(run.event.type).toBe('off-ball-run');
    const mark = resolveAction(run.state, { type: 'mark', actorId: 'kael', targetId: 'yanis' }, new SeededRandom(48));
    expect(mark.event.result).toBe('applied');
    const help = resolveAction(mark.state, { type: 'help', actorId: 'mael', targetId: 'aaron' }, new SeededRandom(49));
    expect(help.event.result).toBe('arrived');
  });

  it('interrupts a prepared sequence when the defense changes the situation', () => {
    const state = createPilotMatch(44);
    const sequence = executeSequence(state, [
      { action: { type: 'fix', actorId: 'yanis', targetId: 'kael' } },
      { action: { type: 'cross', actorId: 'yanis', targetId: 'aaron' } },
      { action: { type: 'duel', actorId: 'aaron', targetId: 'mael' } },
      { action: { type: 'shoot', actorId: 'aaron' } }
    ], 44);
    expect(sequence.events.length).toBeGreaterThan(0);
    expect(sequence.events.length).toBeLessThanOrEqual(4);
    expect(sequence.state.events.length).toBe(sequence.events.length);
  });

  it('applies action intention and timing to a resolution', () => {
    const state = createPilotMatch(44);
    const immediate = resolveAction(state, { type: 'pass', actorId: 'yanis', targetId: 'aaron', intention: 'secure', timing: 'immediate' }, new SeededRandom(50));
    const delayed = resolveAction(state, { type: 'pass', actorId: 'yanis', targetId: 'aaron', intention: 'hidden', timing: 'after-fixation' }, new SeededRandom(50));
    expect(delayed.state.timeSeconds).toBeGreaterThan(immediate.state.timeSeconds);
    expect(immediate.event.type).toBe('pass');
  });

  it('adapts a defense after repeated patterns', () => {
    let state = createPilotMatch(44);
    state = resolveAction(state, { type: 'pass', actorId: 'yanis', targetId: 'aaron' }, new SeededRandom(51)).state;
    state = resolveAction(state, { type: 'pass', actorId: 'yanis', targetId: 'erwan' }, new SeededRandom(52)).state;
    expect(recommendedDefense(state, 'lagny')).toBe('1-5');
    const adapted = adaptDefense(state, 'lagny');
    expect(adapted.teams.lagny.system).toBe('1-5');
    expect(adapted.events.at(-1)?.type).toBe('defensive-adaptation');
  });

  it('lets goalkeeper reads and mental swings affect shot context', () => {
    const state = createPilotMatch(44);
    const read = chooseGoalkeeperRead(state, 'nangis', 'malone', { type: 'lob', side: 'far', height: 'high', power: 90 });
    expect(read.read).toBe('advance');
    const shooter = state.players.aaron;
    expect(shooter).toBeDefined();
    const before = shooter?.confidence ?? 0;
    const shot = resolveAction(state, { type: 'shoot', actorId: 'aaron', shotType: 'roucoulette', shotSide: 'far', shotHeight: 'high' }, new SeededRandom(53));
    expect(shot.state.players.aaron?.confidence).not.toBe(before);
  });

  it('replays the same sequence with the same seed', () => {
    expect(simulatePilotSequence(44)).toEqual(simulatePilotSequence(44));
  });

  it('keeps distinct seeds available for later branching', () => {
    const first = simulatePilotSequence(44);
    const second = simulatePilotSequence(12345);
    expect(first.seed).not.toBe(second.seed);
  });

  it('keeps the ball holder valid after a successful pass', () => {
    const state = createPilotMatch(44);
    const resolution = resolveAction(state, { type: 'pass', actorId: 'yanis', targetId: 'aaron' }, new SeededRandom(1));
    if (resolution.event.result === 'complete') {
      expect(resolution.state.players[resolution.state.ball.holderId]).toBeDefined();
      expect(resolution.state.ball.holderId).toBe('aaron');
    }
  });

  it('records patterns and coaching decisions in the match journal', () => {
    const state = simulatePilotSequence(44);
    const adapted = changeSystem(state, 'nangis', 'hybrid-1-2-3');
    const timedOut = callTimeout(adapted, 'lagny');
    const sevenPlayer = setSevenPlayer(timedOut, 'lagny', true);
    expect(sevenPlayer.teams.nangis.system).toBe('hybrid-1-2-3');
    expect(sevenPlayer.teams.lagny.timeouts).toBe(2);
    expect(sevenPlayer.teams.lagny.sevenPlayer).toBe(true);
    expect(sevenPlayer.events.map((event) => event.type)).toContain('seven-player');
    expect(Object.keys(state.memory.patterns).length).toBeGreaterThan(0);
  });

  it('applies a substitution to the on-court roster', () => {
    const state = createPilotMatch(44);
    const nextState = substitute(state, 'nangis', 'yanis', 'leo');
    const yanis = nextState.players.yanis;
    const leo = nextState.players.leo;
    expect(yanis).toBeDefined();
    expect(leo).toBeDefined();
    expect(yanis?.isOnCourt).toBe(false);
    expect(leo?.isOnCourt).toBe(true);
    expect(leo?.position).toEqual(yanis?.position);
  });

  it('simulates a bounded possession and produces a causal report', () => {
    const result = simulatePossession(createPilotMatch(44), 'nangis', 6);
    const report = createMatchReport(result.state);
    expect(result.eventIds.length).toBeGreaterThan(0);
    expect(result.eventIds.length).toBeLessThanOrEqual(6);
    expect(report.eventCount).toBe(result.state.events.length);
    expect(report.patterns).not.toEqual({});
  });

  it('runs multiple possessions with restart possession after goals', () => {
    const run = simulateMatch(44, 12);
    expect(run.possessions).toHaveLength(12);
    expect(run.report.eventCount).toBe(run.state.events.length);
    expect(run.state.timeSeconds).toBeGreaterThan(0);
    expect(run.state.ball.holderId).toBeDefined();
  });

  it('can simulate a full-length bounded match without a minute script', () => {
    const run = simulateMatch(54, 120);
    expect(run.possessions).toHaveLength(120);
    expect(run.state.timeSeconds).toBeGreaterThan(0);
    expect(run.state.timeSeconds).toBeLessThanOrEqual(3600);
    expect(run.report.eventCount).toBe(run.state.events.length);
  });

  it('validates diversity across a seed campaign', () => {
    const report = runSeedCampaign(1, 12);
    expect(report.runs).toBe(12);
    expect(report.distinctScores).toBeGreaterThanOrEqual(3);
    expect(report.adaptations).toBeGreaterThan(0);
  });
});
