import { SeededRandom } from './random.js';
import { resolveAction, contestAction } from './engine.js';
import { CENTRE, attackingDirection } from './court.js';
import { attackInstalled, driftTeam, placeTeam, pressingDefenderId } from './formation.js';
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
      // L'engageur se place derriere la ligne mediane, sur son propre cote :
      // jamais pile sur le point central (retour de test doc 18 §1.2).
      taker.position = { x: CENTRE.x - attackingDirection(attackingTeam) * 1.5, y: CENTRE.y };
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
    // Nouvelle possession : ballon en main, pas au sol. La regle du marcher
    // repart de zero (O-008, doc 18 §3.3).
    holder.dribbling = false;
    holder.stepsWithoutDribble = 0;
  }
  // La possession debute en installation : l'attaque se place, la defense
  // tient son systeme (doc 18 §3.1).
  nextState.possessionPhase = 'installation';
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

  // Machine a etats de possession (doc 18 §3.1) : tant que l'attaque n'est pas
  // installee, la defense reste sur son systeme, immobile — ni pressing, ni
  // coulissement. Une defense 6-0 ne bouge pas parce que l'attaque approche.
  const installed = attackInstalled(nextState, attackingTeam);
  let defendingMoved = 0;
  let attackingMoved = 0;
  let presser: string | undefined;

  if (!installed) {
    attackingMoved = driftTeam(nextState, attackingTeam, 'attack', { maxStep: 3.2, keepIds: [holder.id] });
  } else {
    if (nextState.possessionPhase === 'installation') {
      nextState.possessionPhase = 'live';
    }
    presser = pressingDefenderId(nextState, defendingTeam);
    defendingMoved = driftTeam(nextState, defendingTeam, system, { maxStep: 3, press: true, ballSideShift: 2.5 });
    attackingMoved = driftTeam(nextState, attackingTeam, 'attack', { maxStep: 2.2, keepIds: [holder.id] });
    // Mouvement permanent sans ballon (P0) : une fois la forme atteinte, le
    // drift ne bouge plus (cibles statiques). Chaque non-porteur ondule donc
    // autour de sa forme — delta borne en sinus du compteur d'evenements
    // (borne, deterministe, sans derive : la somme telescopique reste bornee).
    // Le hand vit meme sans passe : appels, replacements, disponibilite.
    const tick = nextState.events.length;
    for (const player of Object.values(nextState.players)) {
      if (player.team !== attackingTeam || !player.isOnCourt || player.role === 'goalkeeper') continue;
      if (player.id === holder.id) continue;
      let hash = 0;
      for (let i = 0; i < player.id.length; i += 1) hash += player.id.charCodeAt(i);
      const swayY = (Math.sin(tick * 0.7 + hash) - Math.sin((tick - 1) * 0.7 + hash)) * 0.9;
      const swayX = (Math.cos(tick * 0.5 + hash * 1.7) - Math.cos((tick - 1) * 0.5 + hash * 1.7)) * 0.6;
      player.position = {
        x: Math.max(1, Math.min(39, player.position.x + swayX)),
        y: Math.max(1, Math.min(19, player.position.y + swayY))
      };
      attackingMoved += Math.abs(swayY) + Math.abs(swayX);
    }

    if (presser) {
      const defender = nextState.players[presser];
      if (defender && distance(defender.position, holder.position) <= 3) {
        holder.pressure = Math.min(100, holder.pressure + 7);
      }
    }
  }

  const event = appendEvent(nextState, {
    timeSeconds: nextState.timeSeconds,
    type: 'defensive-shift',
    ...(presser ? { actorId: presser } : {}),
    targetId: holder.id,
    result: !installed
      ? 'held'
      : defendingMoved > 0.4 ? 'applied' : 'held',
    causes: !installed
      ? ['attack not installed yet', `defense holds ${system}`]
      : [
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