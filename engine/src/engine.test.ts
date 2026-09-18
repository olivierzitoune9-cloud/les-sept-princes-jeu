import { describe, expect, it } from 'vitest';
import { createPilotMatch } from './match.js';
import { SHOOTING_RANGE, contestAction, defensiveIntents, getSituation, resolveAction, shotProfile, simulatePilotSequence } from './engine.js';
import { chooseNextAction } from './ai.js';
import { callTimeout, changeSystem, setSevenPlayer, substitute } from './coaching.js';
import { createMatchReport, simulateMatch, simulatePossession } from './simulation.js';
import { observeIntervals, passLaneContest, tacticalZone } from './spatial.js';
import { executeSequence } from './sequence.js';
import { adaptDefense, recommendedDefense } from './defense.js';
import { chooseGoalkeeperRead } from './goalkeeper.js';
import { runSeedCampaign } from './validation.js';
import { SeededRandom } from './random.js';
import {
  CENTRE,
  COURT_LENGTH,
  COURT_WIDTH,
  GOAL_DEPTH,
  distanceToGoal,
  shotContext,
  freeThrowLine,
  goalAreaLine,
  goalFrame,
  goalPostLateral
} from './court.js';
import { defensiveBlock, shapeTargets } from './formation.js';
import { installPossession, playAction, stepShapes } from './possession.js';
import type { MatchState } from './types.js';

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
    // Les deux coureurs du croise avancent, chacun vers le couloir oppose.
    const aaronMoved = Math.hypot(
      (cross.state.players.aaron?.position.x ?? 0) - (block.state.players.aaron?.position.x ?? 0),
      (cross.state.players.aaron?.position.y ?? 0) - (block.state.players.aaron?.position.y ?? 0)
    );
    const erwanMoved = Math.hypot(
      (cross.state.players.erwan?.position.x ?? 0) - (block.state.players.erwan?.position.x ?? 0),
      (cross.state.players.erwan?.position.y ?? 0) - (block.state.players.erwan?.position.y ?? 0)
    );
    expect(aaronMoved).toBeGreaterThan(0);
    expect(erwanMoved).toBeGreaterThan(0);
    expect(aaronMoved).toBeLessThanOrEqual(3.51);
    expect(erwanMoved).toBeLessThanOrEqual(3.51);
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

  it('moves the carrier with the ball and builds run-up momentum', () => {
    const state = createPilotMatch(44);
    const run = resolveAction(state, { type: 'run', actorId: 'yanis', targetPosition: { x: 30, y: 10 }, runKind: 'advance' }, new SeededRandom(60));
    const runner = run.state.players.yanis!;
    // La course est bornee : jamais de teleportation.
    expect(runner.position.x).toBeLessThan(30);
    expect(run.state.ball.position.x).toBe(runner.position.x);
    expect(runner.momentum ?? 0).toBeGreaterThan(0);
    const secondRun = resolveAction(run.state, { type: 'run', actorId: 'yanis', targetPosition: { x: 34, y: 10 }, runKind: 'advance' }, new SeededRandom(61));
    expect((secondRun.state.players.yanis?.momentum ?? 0)).toBeGreaterThan(60);
    const shot = resolveAction(secondRun.state, { type: 'shoot', actorId: 'yanis', shotType: 'placed', shotSide: 'near', shotHeight: 'low' }, new SeededRandom(62));
    // Le tir consomme l elan et trace sa cause.
    expect(shot.state.players.yanis?.momentum ?? 0).toBe(0);
    expect(shot.event.causes.join(' ')).toMatch(/run-up momentum|timing|shot quality/);
  });

  it('keeps a strict assignment alive while the block drifts', () => {
    const state = createPilotMatch(44);
    const marked = resolveAction(state, { type: 'mark', actorId: 'kael', targetId: 'yanis' }, new SeededRandom(63));
    expect(marked.state.teams.lagny.assignments?.kael).toBe('yanis');
    let drifted = marked.state;
    for (let step = 0; step < 5; step++) {
      drifted = stepShapes(drifted).state;
    }
    const kael = drifted.players.kael!;
    const yanis = drifted.players.yanis!;
    const gap = Math.hypot(kael.position.x - yanis.position.x, kael.position.y - yanis.position.y);
    expect(gap).toBeLessThan(2.6);
  });

  it('bounds every repositioning step instead of teleporting', () => {
    const state = createPilotMatch(44);
    // Croise : les deux coureurs bougent par pas bornes de 3,5 m, jamais un saut.
    const before = { ...state.players.erwan!.position };
    const yanisBefore = { ...state.players.yanis!.position };
    const crossed = resolveAction(state, { type: 'cross', actorId: 'yanis', targetId: 'erwan' }, new SeededRandom(70));
    const after = crossed.state.players.erwan!.position;
    const moved = Math.hypot(after.x - before.x, after.y - before.y);
    expect(moved).toBeGreaterThan(0);
    expect(moved).toBeLessThanOrEqual(3.51);
    const yanisAfter = crossed.state.players.yanis!.position;
    expect(Math.hypot(yanisAfter.x - yanisBefore.x, yanisAfter.y - yanisBefore.y)).toBeLessThanOrEqual(3.51);
    // Deplacement demande lointain : borne a 3,5 m, jamais un saut.
    const kaelBefore = { ...crossed.state.players.kael!.position };
    const stepped = resolveAction(crossed.state, { type: 'move', actorId: 'kael', targetPosition: { x: 5, y: 5 } }, new SeededRandom(71));
    const kaelAfter = stepped.state.players.kael!.position;
    expect(Math.hypot(kaelAfter.x - kaelBefore.x, kaelAfter.y - kaelBefore.y)).toBeCloseTo(3.5, 1);
    expect(kaelAfter).not.toEqual({ x: 5, y: 5 });
    // Marquage strict lointain : l affectation est immediate, le corps suit par pas.
    const marked = resolveAction(stepped.state, { type: 'mark', actorId: 'mael', targetId: 'yanis' }, new SeededRandom(72));
    expect(marked.state.teams.lagny.assignments?.mael).toBe('yanis');
    const maelBefore = stepped.state.players.mael!.position;
    const maelAfter = marked.state.players.mael!.position;
    expect(Math.hypot(maelAfter.x - maelBefore.x, maelAfter.y - maelBefore.y)).toBeLessThanOrEqual(3.51);
  });


  it('proposes coach defensive intents against the ball holder', () => {
    const state = createPilotMatch(44);
    state.players.kael!.position = { x: 22, y: 10 };
    const intents = defensiveIntents(state, 'lagny');
    // Kael est au contact du porteur : le strict sur le porteur est propose.
    expect(intents.some((intent) => intent.type === 'mark' && intent.targetId === 'yanis')).toBe(true);
    expect(intents.some((intent) => intent.type === 'help' && intent.targetId === 'yanis')).toBe(true);
    // Un focus arbitraire produit aussi ses options individuelles.
    const focused = defensiveIntents(state, 'lagny', 'mael');
    expect(focused.every((intent) => intent.actorId === 'mael')).toBe(true);
    expect(focused.length).toBeGreaterThan(0);
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

describe('placement, defense et terrain', () => {
  it('installe un bloc de six defenseurs devant le but defendu', () => {
    const state = createPilotMatch(44);
    const block = defensiveBlock(state, 'lagny');
    expect(block).toHaveLength(6);
    expect(block.every((point) => point.x > 30 && point.x < 36)).toBe(true);
    expect(new Set(block.map((point) => point.y.toFixed(2))).size).toBe(6);
    const positions = Object.values(state.players)
      .filter((player) => player.isOnCourt)
      .map((player) => `${player.position.x.toFixed(2)}:${player.position.y.toFixed(2)}`);
    expect(new Set(positions).size).toBe(positions.length);
  });

  it('propose le tir depuis la distance d attaque et jamais depuis la largeur', () => {
    const state = createPilotMatch(44);
    // Aile excentree : l'angle ferme sort de la portee effective meme quand
    // la distance axiale reste sous le seuil (mandat pilote-sim).
    state.players.yanis!.position = { x: 32, y: 1.5 };
    expect(getSituation(state).availableActions.filter((action) => action.type === 'shoot')).toHaveLength(0);
    // Arriere plein axe : le tir en suspension est propose, avec un tir place
    // de rechange.
    state.players.yanis!.position = { x: 20 + SHOOTING_RANGE - 1, y: 10 };
    // Deux gestes proposes : suspension par defaut, place en rechange.
    expect(getSituation(state).availableActions.filter((action) => action.type === 'shoot')).toHaveLength(2);
    expect(distanceToGoal({ x: 31, y: 10 }, 'nangis')).toBe(9);
    expect(distanceToGoal({ x: 20, y: 17 }, 'nangis')).toBe(20);
    // L'angle ferme pese : meme distance axiale, l'aile est plus loin en effectif.
    expect(shotContext({ x: 32, y: 1.5 }, 'nangis').effectiveDistance).toBeGreaterThan(shotContext({ x: 32, y: 10 }, 'nangis').effectiveDistance);
  });

  it('bat vraiment le defenseur sur duel gagne et distingue le dribble', () => {
    const state = createPilotMatch(44);
    state.players.aaron!.position = { x: 30, y: 10 };
    state.players.mael!.position = { x: 31, y: 10 };
    state.ball.holderId = 'aaron';
    let won: MatchState | undefined;
    for (let seed = 1; seed <= 60 && !won; seed += 1) {
      const duel = resolveAction(state, { type: 'duel', actorId: 'aaron', targetId: 'mael' }, new SeededRandom(seed));
      if (duel.event.result === 'won') won = duel.state;
    }
    expect(won).toBeDefined();
    // Le battu recule, est marque battu, et ne presse plus dans la foulee.
    expect(won?.players.mael?.beatenUntil ?? 0).toBeGreaterThan(won?.timeSeconds ?? 0);
    expect(won?.players.mael?.position.x ?? 0).toBeLessThan(31);
    expect(won?.players.aaron?.position.x ?? 0).toBeGreaterThan(30);
    // Le dribble ne bat personne : il decale sans marquer beatenUntil.
    const shifted = resolveAction(state, { type: 'dribble', actorId: 'aaron', targetId: 'mael' }, new SeededRandom(7));
    if (shifted.event.result === 'shifted') {
      expect(shifted.state.players.mael?.beatenUntil ?? 0).toBeLessThanOrEqual(shifted.state.timeSeconds);
      expect(shifted.state.players.aaron?.position).not.toEqual({ x: 30, y: 10 });
    }
  });

  it('fait repondre le defenseur le plus proche avant la resolution', () => {
    const state = createPilotMatch(44);
    state.players.aaron!.position = { x: 30, y: 10 };
    state.players.mael!.position = { x: 31.5, y: 10 };
    state.ball.holderId = 'aaron';
    const contested = contestAction(state, { type: 'duel', actorId: 'aaron', targetId: 'mael' });
    expect(contested.contestedBy).toBeDefined();
    expect(['press', 'contain', 'retreat']).toContain(contested.contestAction);
    // Un battu ne conteste plus : le second rideau prend le relais.
    const beatenState = structuredClone(state);
    beatenState.players.mael!.beatenUntil = beatenState.timeSeconds + 6;
    const relayed = contestAction(beatenState, { type: 'duel', actorId: 'aaron', targetId: 'mael' });
    if (relayed.contestedBy) {
      expect(relayed.contestedBy).not.toBe('mael');
    }
    // Le coach peut imposer sa reponse : le repli ouvre le tir.
    const imposed = { type: 'shoot', actorId: 'aaron', contestedBy: 'mael', contestAction: 'retreat' } as const;
    const retreated = resolveAction(state, { ...imposed }, new SeededRandom(11));
    expect(retreated.event.causes.join(' ')).toMatch(/retreat|distance|open/);
  });

  it('donne au croise deux coureurs qui echangent leurs couloirs', () => {
    const state = createPilotMatch(44);
    const aaronBefore = { ...state.players.aaron!.position };
    const erwanBefore = { ...state.players.erwan!.position };
    const cross = resolveAction(state, { type: 'cross', actorId: 'aaron', targetId: 'erwan' }, new SeededRandom(46));
    expect(cross.event.result).toBe('started');
    // Les deux bougent, dans des sens lateraux opposes : ils se croisent.
    expect(cross.state.players.aaron?.position).not.toEqual(aaronBefore);
    expect(cross.state.players.erwan?.position).not.toEqual(erwanBefore);
    const aaronDy = (cross.state.players.aaron?.position.y ?? 0) - aaronBefore.y;
    const erwanDy = (cross.state.players.erwan?.position.y ?? 0) - erwanBefore.y;
    expect(Math.sign(aaronDy)).not.toBe(Math.sign(erwanDy));
  });

  it('expose sortie, repli et interception comme decisions defensives', () => {
    const state = createPilotMatch(44);
    state.players.aaron!.position = { x: 30, y: 10 };
    state.players.mael!.position = { x: 31, y: 10 };
    state.ball.holderId = 'aaron';
    const intents = defensiveIntents(state, 'lagny', 'mael');
    expect(intents.some((intent) => intent.type === 'press')).toBe(true);
    expect(intents.some((intent) => intent.type === 'intercept')).toBe(true);
    const pressed = resolveAction(state, { type: 'press', actorId: 'mael', targetId: 'aaron' }, new SeededRandom(3));
    expect(pressed.event.result).toBe('applied');
    expect(pressed.state.players.aaron?.pressure ?? 0).toBeGreaterThanOrEqual(state.players.aaron?.pressure ?? 0);
    const retreated = resolveAction(state, { type: 'retreat', actorId: 'mael', targetId: 'aaron' }, new SeededRandom(3));
    expect(retreated.event.result).toBe('held');
  });

  it('ferme une ligne de passe quand un defenseur se place dessus', () => {
    const state = createPilotMatch(44);
    const from = { x: 20, y: 10 };
    const to = { x: 18, y: 13.5 };
    const open = passLaneContest(state, 'nangis', from, to);
    state.players.mael!.position = { x: 19, y: 11.7 };
    const closed = passLaneContest(state, 'nangis', from, to);
    expect(open.value).toBe(0);
    expect(closed.value).toBeGreaterThan(0.5);
    expect(closed.defenderId).toBe('mael');
  });

  it('fait bouger le bloc defensif apres chaque action', () => {
    const state = createPilotMatch(44);
    const before = defensiveBlock(state, 'lagny');
    const played = playAction(state, { type: 'fix', actorId: 'yanis', targetId: 'kael' }, new SeededRandom(7));
    const after = defensiveBlock(played.state, 'lagny');
    expect(played.state.events.some((event) => event.type === 'defensive-shift')).toBe(true);
    expect(after).not.toEqual(before);
  });

  it('donne a chaque dispositif une forme distincte', () => {
    const state = createPilotMatch(44);
    const mostAdvanced = (shape: '6-0' | '1-5' | '1-2-3') =>
      Math.min(...Object.values(shapeTargets(state, 'lagny', shape)).map((target) => target.x));
    expect(mostAdvanced('6-0')).toBeGreaterThan(mostAdvanced('1-5'));
    expect(mostAdvanced('1-5')).toBeGreaterThan(mostAdvanced('1-2-3'));
  });

  it('relance au gardien apres un arret et au centre apres un but', () => {
    let saveState: MatchState | undefined;
    let goalState: MatchState | undefined;
    for (let attempt = 1; attempt <= 120 && (!saveState || !goalState); attempt += 1) {
      const base = createPilotMatch(attempt);
      base.players.aaron!.position = { x: 32, y: 10 };
      base.ball.holderId = 'aaron';
      base.ball.position = { x: 32, y: 10 };
      // Le generateur lineaire donne des premieres valeurs tres proches pour des
      // seeds voisines : on espace les seeds pour couvrir les deux issues.
      const shot = playAction(base, { type: 'shoot', actorId: 'aaron' }, new SeededRandom(attempt * 7919 + 13));
      if (shot.event.result === 'save' && !saveState) saveState = shot.state;
      if (shot.event.result === 'goal' && !goalState) goalState = shot.state;
    }
    expect(saveState?.ball.holderId).toBe('teddy');
    expect(saveState?.teams.lagny.possession).toBe(true);
    expect(goalState?.teams.lagny.possession).toBe(true);
    expect(goalState?.ball.holderId).toBe('kael');
    expect(goalState?.players.kael?.position).toEqual(CENTRE);
  });

  it('installe la possession en transition puis converge vers l attaque', () => {
    const state = installPossession(createPilotMatch(44), 'nangis', 'centre');
    const attackTargets = shapeTargets(state, 'nangis', 'attack');
    const spread = (candidate: MatchState) =>
      Object.entries(attackTargets)
        .filter(([id]) => id !== candidate.ball.holderId && candidate.players[id]?.role !== 'goalkeeper')
        .reduce((total, [id, target]) => {
          const player = candidate.players[id];
          if (!player) return total;
          return total + Math.hypot(player.position.x - target.x, player.position.y - target.y);
        }, 0);
    const before = spread(state);
    let current = state;
    for (let step = 0; step < 8; step += 1) {
      current = stepShapes(current).state;
    }
    expect(spread(current)).toBeLessThan(before);
  });

  it('conteste chaque etape meme dans une sequence preparee', () => {
    const state = createPilotMatch(44);
    const result = executeSequence(state, [
      { action: { type: 'pass', actorId: 'yanis', targetId: 'aaron' }, continueOn: ['completed'] },
      { action: { type: 'duel', actorId: 'aaron', targetId: 'mael' }, continueOn: ['won', 'contained', 'foul-defense'] }
    ]);
    expect(result.events.length).toBeGreaterThan(0);
  });

  it('connait les 8 gestes de tir et leurs bonus par poste', () => {
    expect(shotProfile('jump').backBonus).toBe(6);
    expect(shotProfile('extension').wingBonus).toBe(10);
    expect(shotProfile('unknown-gesture').label).toBe('tir place');
  });

  it('trace des zones et des buts aux bonnes dimensions', () => {
    const area = goalAreaLine('nangis');
    expect(Math.max(...area.map((point) => point.x))).toBeCloseTo(6, 5);
    expect(area.every((point) => point.y >= 0 && point.y <= COURT_WIDTH)).toBe(true);
    const nine = freeThrowLine('lagny');
    expect(Math.min(...nine.map((point) => point.x))).toBeCloseTo(COURT_LENGTH - 9, 5);
    expect(nine.every((point) => point.y >= 0 && point.y <= COURT_WIDTH)).toBe(true);
    const frame = goalFrame('lagny');
    expect(Math.min(...frame.map((point) => point.x))).toBe(COURT_LENGTH);
    expect(Math.max(...frame.map((point) => point.x))).toBeCloseTo(COURT_LENGTH + GOAL_DEPTH, 5);
    expect(goalPostLateral()).toEqual([8.5, 11.5]);
  });
});
