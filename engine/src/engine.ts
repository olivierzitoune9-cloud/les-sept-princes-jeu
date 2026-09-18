import { SeededRandom } from './random.js';
import { createPilotMatch } from './match.js';
import { distanceToGoal, attackingDirection } from './court.js';
import { observeIntervals, passLaneContest } from './spatial.js';
import { defensivePressure } from './defense.js';
import { goalkeeperAdvantage, mentalSwing } from './goalkeeper.js';
import type { ActionIntent, ActionResolution, MatchEvent, MatchState, Situation, TeamId, Vector2 } from './types.js';

// Portee de tir credible, en metres. Au dela, aucun tir n est propose.
export const SHOOTING_RANGE = 15;

function distance(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function cloneState(state: MatchState): MatchState {
  return structuredClone(state);
}

function opposingTeam(team: TeamId): TeamId {
  return team === 'nangis' ? 'lagny' : 'nangis';
}

function findGoalkeeper(state: MatchState, team: TeamId): string | undefined {
  if (state.teams[team].sevenPlayer) {
    return undefined;
  }
  const goalkeeper = Object.values(state.players).find((player) => player.team === team && player.role === 'goalkeeper' && player.isOnCourt);
  return goalkeeper?.id;
}

function appendEvent(state: MatchState, event: Omit<MatchEvent, 'id'>): MatchEvent {
  const completeEvent = { ...event, id: state.events.length + 1 };
  state.events.push(completeEvent);
  state.memory.recentEvents = [...state.memory.recentEvents.slice(-7), `${completeEvent.type}:${completeEvent.result}`];
  const patternKey = `${completeEvent.type}:${completeEvent.result}`;
  const previous = state.memory.patterns[patternKey];
  state.memory.patterns[patternKey] = {
    key: patternKey,
    occurrences: (previous?.occurrences ?? 0) + 1,
    confidence: Math.min(1, (previous?.confidence ?? 0) + 0.12),
    lastSeenAt: completeEvent.timeSeconds
  };
  return completeEvent;
}

function advanceTime(state: MatchState, seconds: number): void {
  state.timeSeconds += seconds;
  state.period = state.timeSeconds < 1800 ? 1 : 2;
}

function spendEnergy(state: MatchState, actorId: string, amount: number): void {
  const player = state.players[actorId];
  if (player) {
    player.energy = Math.max(0, player.energy - amount);
  }
}

function timingDuration(timing: ActionIntent['timing']): number {
  switch (timing) {
    case 'after-pass': return 3;
    case 'after-fixation': return 4;
    case 'after-block': return 3;
    case 'after-movement': return 2;
    case 'after-side-change': return 5;
    default: return 0;
  }
}

function intentionModifier(intention: ActionIntent['intention']): number {
  switch (intention) {
    case 'secure': return 8;
    case 'hidden': return -6;
    case 'attack-inside': return 5;
    case 'attack-outside': return 3;
    case 'protect': return -3;
    case 'accelerate': return 4;
    case 'temporize': return -2;
    default: return 0;
  }
}

function transferToOpponent(state: MatchState, team: TeamId): void {
  const opponent = Object.values(state.players)
    .filter((player) => player.team === opposingTeam(team) && player.isOnCourt && player.role !== 'goalkeeper')
    .sort((first, second) => distance(first.position, state.ball.position) - distance(second.position, state.ball.position))[0];
  if (opponent) {
    state.ball.holderId = opponent.id;
    state.ball.position = { ...opponent.position };
  }
  state.teams[team].possession = false;
  state.teams[opposingTeam(team)].possession = true;
}

export function getSituation(state: MatchState): Situation {
  const holder = state.players[state.ball.holderId];
  if (!holder) {
    throw new Error(`Unknown ball holder ${state.ball.holderId}`);
  }
  const opponents = Object.values(state.players).filter((player) => player.team !== holder.team && player.isOnCourt && player.role !== 'goalkeeper');
  const closestOpponent = opponents.sort((first, second) => distance(first.position, holder.position) - distance(second.position, holder.position))[0];
  // Les quatre partenaires les plus proches deviennent les options de passe,
  // pas les quatre premiers de l effectif.
  const teammates = Object.values(state.players)
    .filter((player) => player.team === holder.team && player.id !== holder.id && player.isOnCourt && player.role !== 'goalkeeper')
    .sort((first, second) => distance(first.position, holder.position) - distance(second.position, holder.position));
  const availableActions: ActionIntent[] = teammates.slice(0, 4).map((player) => ({ type: 'pass', actorId: holder.id, targetId: player.id }));
  if (closestOpponent) {
    availableActions.push({ type: 'duel', actorId: holder.id, targetId: closestOpponent.id });
    availableActions.push({ type: 'fix', actorId: holder.id, targetId: closestOpponent.id });
  }
  const crossTarget = teammates.find((player) => player.role === 'back' || player.role === 'center');
  if (crossTarget) {
    availableActions.push({ type: 'cross', actorId: holder.id, targetId: crossTarget.id });
  }
  // Deplacements du porteur (doc 01 §4) : avancer, diagonale interieure,
  // decalage exterieur. La course construit l elan du tir en appui.
  const attackSign = holder.team === 'nangis' ? 1 : -1;
  const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
  const advanceTarget = { x: clamp(holder.position.x + attackSign * 3, 1, 39), y: holder.position.y };
  const insideTarget = {
    x: clamp(holder.position.x + attackSign * 2, 1, 39),
    y: clamp(holder.position.y + (holder.position.y <= 10 ? 2.5 : -2.5), 1, 19)
  };
  const outsideTarget = { x: holder.position.x, y: clamp(holder.position.y + (holder.position.y <= 10 ? -3 : 3), 1, 19) };
  availableActions.push({ type: 'run', actorId: holder.id, targetPosition: advanceTarget, runKind: 'advance' });
  availableActions.push({ type: 'run', actorId: holder.id, targetPosition: insideTarget, runKind: 'diagonal' });
  availableActions.push({ type: 'run', actorId: holder.id, targetPosition: outsideTarget, runKind: 'lateral' });
  // Le tir n est propose que depuis une distance credible, mesuree sur l axe
  // longueur par distanceToGoal. Jamais sur la largeur du terrain.
  if (distanceToGoal(holder.position, holder.team) <= SHOOTING_RANGE) {
    availableActions.push({ type: 'shoot', actorId: holder.id });
  }
  const intervals = observeIntervals(state, holder.team);
  return {
    state,
    availableActions,
    openIntervals: intervals.filter((interval) => interval.openness > 0.35).map((interval) => interval.id),
    intervals,
    threats: opponents.slice(0, 3).map((player) => player.id)
  };
}

export function resolveAction(state: MatchState, action: ActionIntent, random = new SeededRandom(state.seed + state.events.length)): ActionResolution {
  const nextState = cloneState(state);
  const actor = nextState.players[action.actorId];
  if (!actor || !actor.isOnCourt) {
    throw new Error(`Invalid actor ${action.actorId}`);
  }
  const target = action.targetId ? nextState.players[action.targetId] : undefined;
  const opponent = target && target.team !== actor.team ? target : undefined;
  advanceTime(nextState, (action.type === 'move' || action.type === 'run' ? 2 : 4) + timingDuration(action.timing));
  spendEnergy(nextState, actor.id, action.type === 'duel' ? 7 : action.type === 'shoot' ? 5 : 2);
  // L elan se dissipe entre deux actions : il faut enchainer course puis tir.
  actor.momentum = Math.max(0, (actor.momentum ?? 0) - 15);

  if (action.type === 'pass') {
    if (!target || target.team !== actor.team) {
      throw new Error('A pass target must be a teammate');
    }
    const pressure = Math.max(0, actor.pressure - 30);
    const defensivePressureValue = defensivePressure(nextState.teams[opposingTeam(actor.team)].system, actor.role, action.intention);
    // Un defenseur sur la ligne ferme la passe : c est le bloc qui compte.
    const lane = passLaneContest(nextState, actor.team, actor.position, target.position);
    const successProbability = (actor.passing + target.reception - pressure - defensivePressureValue - (distance(actor.position, target.position) * 2) + intentionModifier(action.intention) - lane.value * 45) / 160;
    const success = random.chance(successProbability);
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'pass',
      actorId: actor.id,
      targetId: target.id,
      result: success ? 'complete' : 'intercepted',
      causes: success
        ? ['passing quality', 'reception timing', lane.value > 0.35 ? 'lane contested but released' : 'available lane']
        : [lane.value > 0.35 ? 'defensive lane closure' : 'pressure', 'distance', 'defensive reading']
    });
    if (success) {
      nextState.ball.holderId = target.id;
      nextState.ball.position = { ...target.position };
      nextState.teams[actor.team].possession = true;
      nextState.teams[opposingTeam(actor.team)].possession = false;
    } else {
      transferToOpponent(nextState, actor.team);
    }
    return { state: nextState, event };
  }

  if (action.type === 'duel') {
    if (!opponent) {
      throw new Error('A duel target must be an opponent');
    }
    const defensivePressureValue = defensivePressure(nextState.teams[opposingTeam(actor.team)].system, actor.role, action.intention);
    const advantage = actor.duel + actor.acceleration + actor.confidence / 2 - opponent.defense - opponent.anticipation / 2 - defensivePressureValue / 2 + intentionModifier(action.intention) + (actor.momentum ?? 0) * 0.08;
    const contactFoul = random.chance(Math.max(0.02, (actor.pressure + opponent.pressure) / 500));
    if (contactFoul) {
      const event = appendEvent(nextState, {
        timeSeconds: nextState.timeSeconds,
        type: 'duel',
        actorId: actor.id,
        targetId: opponent.id,
        result: 'foul-defense',
        causes: ['contact', 'pressure', 'late defensive timing']
      });
      actor.pressure = Math.max(0, actor.pressure - 5);
      return { state: nextState, event };
    }
    const success = random.chance((advantage + 100) / 200);
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'duel',
      actorId: actor.id,
      targetId: opponent.id,
      result: success ? 'won' : 'contained',
      causes: success ? ['first step', 'acceleration', 'space'] : ['defensive anticipation', 'help coverage', 'fatigue']
    });
    actor.pressure = success ? Math.max(0, actor.pressure - 8) : Math.min(100, actor.pressure + 10);
    if (success) {
      actor.position = { x: actor.position.x + (actor.team === 'nangis' ? 2 : -2), y: actor.position.y };
      nextState.ball.position = { ...actor.position };
    }
    return { state: nextState, event };
  }

  if (action.type === 'fix') {
    if (!opponent) {
      throw new Error('A fixation target must be an opponent');
    }
    actor.position = { x: actor.position.x + (actor.team === 'nangis' ? 1 : -1), y: actor.position.y };
    opponent.pressure = Math.min(100, opponent.pressure + 14);
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'fixation',
      actorId: actor.id,
      targetId: opponent.id,
      result: 'attracted',
      causes: ['carrier threat', 'defender choice', 'space created elsewhere']
    });
    return { state: nextState, event };
  }

  if (action.type === 'block') {
    if (!opponent || actor.team === opponent.team) {
      throw new Error('A block target must be an opponent');
    }
    actor.position = { x: opponent.position.x, y: opponent.position.y + (actor.position.y < 10 ? -1 : 1) };
    opponent.pressure = Math.min(100, opponent.pressure + 8);
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'block',
      actorId: actor.id,
      targetId: opponent.id,
      result: 'set',
      causes: ['screen position', 'timing', 'defensive reaction pending']
    });
    return { state: nextState, event };
  }

  if (action.type === 'cross') {
    if (!target || target.team !== actor.team) {
      throw new Error('A cross target must be a teammate');
    }
    target.position = { x: target.position.x, y: 20 - target.position.y };
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'cross',
      actorId: actor.id,
      targetId: target.id,
      result: 'started',
      causes: ['role exchange', 'defensive tracking decision', 'new interval geometry']
    });
    return { state: nextState, event };
  }

  if (action.type === 'run') {
    if (!action.targetPosition) {
      throw new Error('A run target is required');
    }
    // Course bornee : jamais de teleportation, chaque action deplace au plus
    // 3,5 m (doc 17, ecart E-003).
    const maxStep = 3.5;
    const remaining = distance(actor.position, action.targetPosition);
    const ratio = remaining > maxStep ? maxStep / remaining : 1;
    actor.position = {
      x: actor.position.x + (action.targetPosition.x - actor.position.x) * ratio,
      y: actor.position.y + (action.targetPosition.y - actor.position.y) * ratio
    };
    const isCarrier = actor.id === nextState.ball.holderId;
    if (isCarrier) {
      // Le porteur avance avec le ballon : la course construit l elan qui
      // alimente le tir en appui (doc 17, ecart E-002).
      nextState.ball.position = { ...actor.position };
      actor.momentum = Math.min(100, (actor.momentum ?? 0) + 45);
    }
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'off-ball-run',
      actorId: actor.id,
      result: 'completed',
      causes: isCarrier ? ['carrier advance', 'run-up built', 'shooting balance'] : ['space attack', 'timing', 'defensive attention']
    });
    return { state: nextState, event };
  }

  if (action.type === 'mark') {
    if (!opponent) {
      throw new Error('A mark target must be an opponent');
    }
    // Marquage strict persistant : l affectation survit au coulissement du
    // bloc jusqu a la fin de la possession (rapport 14, phase B).
    const team = nextState.teams[actor.team];
    team.assignments = { ...(team.assignments ?? {}), [actor.id]: opponent.id };
    actor.position = {
      x: Math.max(0.5, Math.min(39.5, opponent.position.x - attackingDirection(actor.team) * 1.3)),
      y: Math.max(1, Math.min(19, opponent.position.y))
    };
    opponent.pressure = Math.min(100, opponent.pressure + 12);
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'mark',
      actorId: actor.id,
      targetId: opponent.id,
      result: 'applied',
      causes: ['defensive priority', 'persistent assignment', 'line denial']
    });
    return { state: nextState, event };
  }

  if (action.type === 'help') {
    if (!opponent) {
      throw new Error('An help target must be an opponent');
    }
    actor.position = { x: opponent.position.x + (actor.team === 'nangis' ? -1 : 1), y: opponent.position.y };
    opponent.pressure = Math.min(100, opponent.pressure + 8);
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'defensive-help',
      actorId: actor.id,
      targetId: opponent.id,
      result: 'arrived',
      causes: ['cover teammate', 'close interval', 'space abandoned elsewhere']
    });
    return { state: nextState, event };
  }

  if (action.type === 'shoot') {
    const goalkeeperId = findGoalkeeper(nextState, opposingTeam(actor.team));
    const goalkeeper = goalkeeperId ? nextState.players[goalkeeperId] : undefined;
    if (!nextState.teams[opposingTeam(actor.team)].sevenPlayer && !goalkeeper) {
      throw new Error(`No goalkeeper for ${opposingTeam(actor.team)}`);
    }
    const distanceToGoal = actor.team === 'nangis' ? 40 - actor.position.x : actor.position.x;
    // Tir en appui : l elan pris en course alimente la puissance (doc 17, E-002).
    const momentum = actor.momentum ?? 0;
    const momentumBonus = momentum * (action.shotType === 'placed' ? 0.12 : 0.06);
    const shootingPower = actor.shooting - distanceToGoal * 0.7 - actor.pressure * 0.3 + intentionModifier(action.intention) + momentumBonus;
    const savePower = goalkeeper ? goalkeeper.goalkeeper + goalkeeper.anticipation * 0.35 : 0;
    const goalkeeperRead = goalkeeper ? goalkeeperAdvantage(nextState, goalkeeper.team, actor.id, {
      type: action.shotType ?? 'placed',
      side: action.shotSide ?? 'center',
      height: action.shotHeight ?? 'middle',
      power: actor.shooting
    }) : 0;
    const goal = random.chance((shootingPower - savePower - goalkeeperRead + 100) / 200);
    const eventData: Omit<MatchEvent, 'id'> = {
      timeSeconds: nextState.timeSeconds,
      type: 'shoot',
      actorId: actor.id,
      result: goal ? 'goal' : 'save',
      causes: goal
        ? momentum >= 40 ? ['shot quality', 'run-up momentum', 'angle'] : ['shot quality', 'angle', 'timing']
        : momentum >= 40 ? ['goalkeeper reading', 'run-up momentum', 'pressure'] : ['goalkeeper reading', 'pressure', 'shot distance']
    };
    if (goalkeeper) {
      eventData.targetId = goalkeeper.id;
    }
    const event = appendEvent(nextState, eventData);
    if (goal) {
      nextState.teams[actor.team].score += 1;
      nextState.teams.nangis.possession = actor.team === 'nangis';
      nextState.teams.lagny.possession = actor.team === 'lagny';
    } else {
      // Arret : le gardien garde le ballon et sa equipe recupere la possession.
      // C est lui qui relance, pas un defenseur quelconque.
      nextState.teams[actor.team].possession = false;
      nextState.teams[opposingTeam(actor.team)].possession = true;
      if (goalkeeper) {
        nextState.ball.holderId = goalkeeper.id;
        nextState.ball.position = { ...goalkeeper.position };
      } else {
        transferToOpponent(nextState, actor.team);
      }
    }
    // Le tir consomme l elan pris en course.
    actor.momentum = 0;
    return { state: mentalSwing(nextState, actor.id, goal), event };
  }

  if (action.type === 'move') {
    if (!action.targetPosition) {
      throw new Error('A move target is required');
    }
    actor.position = { ...action.targetPosition };
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'move',
      actorId: actor.id,
      result: 'completed',
      causes: ['requested trajectory']
    });
    return { state: nextState, event };
  }

  throw new Error(`Unsupported action ${action.type}`);
}

// Options defensives du coach (doc 17, ecart E-001) : le marquage strict et
// l aide sont des decisions, pas des automatismes. L interface consomme ces
// intents et les joue par playAction, sans rien recoder.
export function defensiveIntents(state: MatchState, defendingTeam: TeamId, focusId?: string): ActionIntent[] {
  const holder = state.players[state.ball.holderId];
  if (!holder || holder.team === defendingTeam) {
    return [];
  }
  const focus = focusId ? state.players[focusId] : undefined;
  const reference = focus && focus.team === defendingTeam ? focus.position : holder.position;
  const defenders = Object.values(state.players)
    .filter((player) => player.team === defendingTeam && player.isOnCourt && player.role !== 'goalkeeper')
    .sort((first, second) => distance(first.position, reference) - distance(second.position, reference));
  const defender = focus && focus.team === defendingTeam && focus.role !== 'goalkeeper' && focus.isOnCourt ? focus : defenders[0];
  if (!defender) {
    return [];
  }
  const attackers = Object.values(state.players)
    .filter((player) => player.team !== defendingTeam && player.isOnCourt && player.role !== 'goalkeeper' && player.id !== holder.id)
    .sort((first, second) => distance(first.position, defender.position) - distance(second.position, defender.position));
  const intents: ActionIntent[] = [];
  if (distance(defender.position, holder.position) <= 6) {
    intents.push({ type: 'mark', actorId: defender.id, targetId: holder.id });
  } else if (attackers[0]) {
    intents.push({ type: 'mark', actorId: defender.id, targetId: attackers[0].id });
  }
  intents.push({ type: 'help', actorId: defender.id, targetId: holder.id });
  return intents;
}

export function simulatePilotSequence(seed = 44): MatchState {
  let state = createPilotMatch(seed);
  const random = new SeededRandom(seed);
  state = resolveAction(state, { type: 'pass', actorId: 'yanis', targetId: 'aaron' }, random).state;
  state = resolveAction(state, { type: 'duel', actorId: 'aaron', targetId: 'mael' }, random).state;
  return resolveAction(state, { type: 'shoot', actorId: 'aaron' }, random).state;
}
