import { SeededRandom } from './random.js';
import { resolveAction, contestAction } from './engine.js';
import { CENTRE } from './court.js';
import { driftTeam, placeTeam, pressingDefenderId } from './formation.js';
import type { ActionIntent, MatchEvent, MatchState, TeamId } from './types.js';

// Boucle d une action jouee : resolution, puis replacement des deux equipes.
// L interface consomme ces fonctions et ne recode aucune decision.

export type RestartKind = 'centre' | 'goalkeeper' | 'interception';

function opposingTeam(team: TeamId): TeamId {
  return team === 'nangis' ? 'lagny' : 'nangis';
}

function distance(first: { x: number; y: number }, second: { x: number; y: number }): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
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

// Remise en jeu : l attaque se replace en transition, la defense reprend son
// dispositif du moment. L elan retombe a la remise en jeu (doc 17, E-002).
export function installPossession(state: MatchState, attackingTeam: TeamId, restart: RestartKind = 'interception'): MatchState {
  const nextState = structuredClone(state);
  const defendingTeam = opposingTeam(attackingTeam);
  nextState.teams[attackingTeam].possession = true;
  nextState.teams[defendingTeam].possession = false;
  // Les marquages stricts d une possession n engagent pas la suivante.
  nextState.teams[attackingTeam].assignments = {};
  nextState.teams[defendingTeam].assignments = {};

  let holderId = nextState.ball.holderId;
  if (restart === 'centre') {
    const attackers = Object.values(nextState.players).filter(
      (player) => player.team === attackingTeam && player.isOnCourt && player.role !== 'goalkeeper'
    );
    const taker = attackers.find((player) => player.role === 'center') ?? attackers[0];
    if (taker) {
      taker.position = { ...CENTRE };
      holderId = taker.id;
    }
  }
  nextState.ball.holderId = holderId;
  const holder = nextState.players[holderId];
  if (holder) {
    nextState.ball.position = { ...holder.position };
  }

  placeTeam(nextState, defendingTeam, nextState.teams[defendingTeam].system);
  placeTeam(nextState, attackingTeam, 'transition', [holderId]);
  if (holder) {
    nextState.ball.position = { ...holder.position };
    holder.momentum = 0;
  }
  return nextState;
}

export interface ShapeStep {
  state: MatchState;
  moved: number;
  pressed?: string;
  event: MatchEvent;
}

// Un pas de replacement : la defense presse le porteur et coulisse vers le
// ballon, l attaque se rapproche de sa forme installee. Aucun saut de position.
export function stepShapes(state: MatchState): ShapeStep {
  const nextState = structuredClone(state);
  const holder = nextState.players[nextState.ball.holderId];
  if (!holder) {
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'defensive-shift',
      result: 'held',
      causes: ['no ball holder']
    });
    return { state: nextState, moved: 0, event };
  }
  const attackingTeam = holder.team;
  const defendingTeam = opposingTeam(attackingTeam);
  const system = nextState.teams[defendingTeam].system;
  const presser = pressingDefenderId(nextState, defendingTeam);
  const defendingMoved = driftTeam(nextState, defendingTeam, system, { maxStep: 3, press: true, ballSideShift: 2.5 });
  const attackingMoved = driftTeam(nextState, attackingTeam, 'attack', { maxStep: 2.2, keepIds: [holder.id] });

  if (presser) {
    const defender = nextState.players[presser];
    if (defender && distance(defender.position, holder.position) <= 3) {
      holder.pressure = Math.min(100, holder.pressure + 7);
    }
  }

  const event = appendEvent(nextState, {
    timeSeconds: nextState.timeSeconds,
    type: 'defensive-shift',
    ...(presser ? { actorId: presser } : {}),
    targetId: holder.id,
    result: defendingMoved > 0.4 ? 'applied' : 'held',
    causes: [
      presser ? 'carrier pressed' : 'no defender in range',
      `shape ${system}`,
      defendingMoved > 0.4 ? 'block shifted' : 'block already set'
    ]
  });
  return {
    state: nextState,
    moved: defendingMoved + attackingMoved,
    ...(presser ? { pressed: presser } : {}),
    event
  };
}

export interface PlayedAction {
  state: MatchState;
  event: MatchEvent;
  possessionChanged: boolean;
  restart?: RestartKind;
  shapeEvent?: MatchEvent;
}

// Une action complete : resolution puis consequence collective.
// Apres un but, un arret ou une interception, la remise en jeu est installee
// immediatement, ce qui evite les positions incoherentes.
export function playAction(
  state: MatchState,
  action: ActionIntent,
  random = new SeededRandom(state.seed + state.events.length)
): PlayedAction {
  // Toute action offensive traverse la contestation defensive : le defenseur
  // le plus proche repond (mandat pilote-sim, doc 00). Si le coach a deja
  // choisi sa reponse via contestedBy, on la garde ; sinon l'automate repond.
  const contested = contestAction(state, action);
  const resolution = resolveAction(state, contested, random);
  const actor = state.players[action.actorId];
  const actorTeam = actor?.team;
  const possessionChanged = actorTeam ? !resolution.state.teams[actorTeam].possession : false;

  let restart: RestartKind | undefined;
  if (resolution.event.result === 'goal') {
    restart = 'centre';
  } else if (resolution.event.result === 'save') {
    restart = 'goalkeeper';
  } else if (possessionChanged) {
    restart = 'interception';
  }

  if (restart && actorTeam) {
    const restartTeam = opposingTeam(actorTeam);
    return {
      state: installPossession(resolution.state, restartTeam, restart),
      event: resolution.event,
      possessionChanged: true,
      restart
    };
  }

  const shaped = stepShapes(resolution.state);
  return {
    state: shaped.state,
    event: resolution.event,
    possessionChanged,
    shapeEvent: shaped.event
  };
}