import { SeededRandom } from './random.js';
import { resolveAction } from './engine.js';
import { installPossession } from './possession.js';
import { distanceToGoal } from './court.js';
import { locomotionSpeed, observeDynamicGaps, passLaneContest, type GapObservation } from './spatial.js';
import type { ActionIntent, DuelDecision, MatchEvent, MatchState, TeamId, Vector2 } from './types.js';

// Systeme de vollee planifiee (D-019, spec 19) : lecture a temps fige, plans
// verrouilles en aveugle des deux cotes, puis simulation a tick de 3 a 5 s.
// La grandeur fondamentale est la FENETRE (temps de fermeture defenseur moins
// temps d'acces attaquant). Les jauges n'existent pas ici : le moteur produit
// des faits (gaps, fenetres, causes), l'interface les resumera.

export type AttackVolleyIntent = 'move' | 'attackSpace' | 'fix' | 'pass' | 'shoot' | 'cut' | 'screen' | 'support' | 'stretch';
export type DefenseVolleyIntent = 'shift' | 'pressBall' | 'help' | 'deny' | 'contain' | 'hold';

// Une fleche = une intention continue (spec 19 §4). La trajectoire dit OU on
// va ; l'intention dit POURQUOI. Le moteur determine comment ca se realise.
export interface VolleyOrder {
  actorId: string;
  kind: AttackVolleyIntent;
  targetPosition?: Vector2;
  // Passe : receveur. Fixation : defenseur vise.
  targetId?: string;
  // Secondes dans la volee (defaut 0).
  startAt?: number;
  shotType?: 'placed' | 'power' | 'lob' | 'roucoulette' | 'chabala' | 'jump' | 'standing' | 'extension';
  shotSide?: 'near' | 'far' | 'center';
  shotHeight?: 'high' | 'low' | 'middle';
}

export type VolleyTrigger = 'defender-steps' | 'gap-opens';

export interface VolleyConditional {
  actorId: string;
  trigger: VolleyTrigger;
  order: VolleyOrder;
}

export interface VolleyPlan {
  team: TeamId;
  orders: VolleyOrder[];
  conditional?: VolleyConditional;
}

export interface DefenseOrder {
  actorId: string;
  kind: DefenseVolleyIntent;
  // Coulissement maximal autorise sur la volee, en metres.
  maxDisplacement?: number;
}

export interface DefensePlan {
  team: TeamId;
  orders: DefenseOrder[];
}

export const MINOR_INTENTS: readonly AttackVolleyIntent[] = ['move', 'stretch', 'support'];
export const MAX_MAJOR_ORDERS = 3;
export const MAX_MINOR_ORDERS = 2;
export const MAX_CONDITIONALS = 1;

// Horloge de match (D-019) : pas de vitesses, duree configurable a la FIFA.
// Defaut : deux mi-temps de 10 minutes simulees. Le temps n'avance que par
// volees ; la planification est hors temps de match.
export const HALF_COUNT = 2;
export const DEFAULT_HALF_SECONDS = 600;

export function matchLengthSeconds(halfSeconds: number = DEFAULT_HALF_SECONDS): number {
  return halfSeconds * HALF_COUNT;
}

const TICK = 0.2;
const MAX_VOLLEY_SECONDS = 5;
const PASS_SPEED = 14;
const DUEL_CONTACT = 2;
const FIX_CONTACT = 2.5;
const SHOT_RANGE = 11;
const DEFENSE_ENERGY_COST_PER_METRE = 0.5;
const ATTACK_ENERGY_COST_PER_METRE = 0.2;

const DEFAULT_MAX_DISPLACEMENT: Record<DefenseVolleyIntent, number> = {
  shift: 3,
  pressBall: 4,
  help: 4,
  deny: 3.5,
  contain: 2,
  hold: 0
};

// L'ordre defensif verrouille en aveugle se traduit en decision de duel au
// moment de la collision geometrique (spec 19 §5).
const DEFENSE_TO_DUEL: Record<DefenseVolleyIntent, DuelDecision> = {
  shift: 'hold',
  hold: 'hold',
  pressBall: 'contain',
  contain: 'contain',
  help: 'help',
  deny: 'intercept'
};

function other(team: TeamId): TeamId {
  return team === 'nangis' ? 'lagny' : 'nangis';
}

function dist(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function stepToward(from: Vector2, target: Vector2, step: number): Vector2 {
  const total = dist(from, target);
  if (total <= step || total === 0) return { ...target };
  const ratio = step / total;
  return { x: from.x + (target.x - from.x) * ratio, y: from.y + (target.y - from.y) * ratio };
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

// Validation des plans (aveugles : ils ne se connaissent pas, mais chacun doit
// etre coherent avec l'etat verrouille). Budget spec 19 §4 : 3 majeures + 2
// mineures, 1 conditionnel au plus.
export function validateVolleyPlan(state: MatchState, attack: VolleyPlan, defense: DefensePlan): void {
  if (attack.team === defense.team) {
    throw new Error('Attack and defense plans must target opposite teams');
  }
  const major = attack.orders.filter((order) => !MINOR_INTENTS.includes(order.kind));
  const minor = attack.orders.filter((order) => MINOR_INTENTS.includes(order.kind));
  if (major.length > MAX_MAJOR_ORDERS) {
    throw new Error(`Too many major orders: ${major.length} > ${MAX_MAJOR_ORDERS}`);
  }
  if (minor.length > MAX_MINOR_ORDERS) {
    throw new Error(`Too many minor orders: ${minor.length} > ${MAX_MINOR_ORDERS}`);
  }
  const holderId = state.ball.holderId;
  for (const order of attack.orders) {
    const actor = state.players[order.actorId];
    if (!actor || actor.team !== attack.team || !actor.isOnCourt) {
      throw new Error(`Order actor ${order.actorId} is not on court for ${attack.team}`);
    }
    if ((order.kind === 'pass' || order.kind === 'shoot') && order.actorId !== holderId) {
      throw new Error(`Only the holder can ${order.kind} (holder is ${holderId})`);
    }
    if (order.kind === 'pass' && !order.targetId) {
      throw new Error('A pass order needs a target receiver');
    }
    if (order.kind === 'fix' && !order.targetId) {
      throw new Error('A fix order needs a defender target');
    }
    if (['move', 'attackSpace', 'cut', 'screen', 'support', 'stretch'].includes(order.kind) && !order.targetPosition) {
      throw new Error(`Order ${order.kind} for ${order.actorId} needs a targetPosition`);
    }
  }
  if (attack.conditional) {
    const actor = state.players[attack.conditional.actorId];
    if (!actor || actor.team !== attack.team || !actor.isOnCourt) {
      throw new Error(`Conditional actor ${attack.conditional.actorId} is not on court for ${attack.team}`);
    }
  }
  for (const order of defense.orders) {
    const actor = state.players[order.actorId];
    if (!actor || actor.team !== defense.team || !actor.isOnCourt || actor.role === 'goalkeeper') {
      throw new Error(`Defense actor ${order.actorId} is not an on-court field player for ${defense.team}`);
    }
  }
}

export interface VolleyResult {
  state: MatchState;
  // Evenements produits par cette volee uniquement.
  events: MatchEvent[];
  // Lecture finale de l'etat du siege (spec 19 §6) : les gaps sont des faits.
  gaps: GapObservation[];
  durationSeconds: number;
  endedEarly: boolean;
  endReason: 'shot' | 'goal' | 'save' | 'turnover' | 'duration';
  possessionChanged: boolean;
}

interface RunOrder {
  order: VolleyOrder;
  done: boolean;
}

interface Flight {
  passerId: string;
  receiverId: string;
  remaining: number;
  total: number;
}

function absorb(target: MatchState, source: MatchState): void {
  target.players = source.players;
  target.teams = source.teams;
  target.ball = source.ball;
  target.events = source.events;
  target.memory = source.memory;
  target.timeSeconds = source.timeSeconds;
  target.possessionPhase = source.possessionPhase;
}

function ramp(time: number): number {
  return Math.min(1, 0.5 + time / 0.8);
}

type PlayerLike = MatchState['players'][string];

function nearestDefenderOf(state: MatchState, team: TeamId, point: Vector2, radius: number): PlayerLike | undefined {
  let best: PlayerLike | undefined;
  let bestDistance = radius;
  for (const player of Object.values(state.players)) {
    if (player.team !== team || !player.isOnCourt || player.role === 'goalkeeper') continue;
    const d = dist(player.position, point);
    if (d <= bestDistance) {
      best = player;
      bestDistance = d;
    }
  }
  return best;
}

// Une volee complete : plans verrouilles en aveugle, simulation a tick, arret
// anticipe sur evenement majeur. Meme etat + memes plans + meme seed = meme
// volee (spec 19 §7).
export function resolveVolley(
  state: MatchState,
  attack: VolleyPlan,
  defense: DefensePlan,
  random: SeededRandom = new SeededRandom(state.seed + state.events.length * 31 + Math.floor(state.timeSeconds * 7))
): VolleyResult {
  validateVolleyPlan(state, attack, defense);
  const working = structuredClone(state);
  working.possessionPhase = 'live';
  const attackingTeam = attack.team;
  const defendingTeam = defense.team;
  const startEventCount = working.events.length;

  const defenseByActor = new Map(defense.orders.map((order) => [order.actorId, order]));
  const initialDefenderPositions = new Map<string, Vector2>();
  const initialAttackerPositions = new Map<string, Vector2>();
  for (const player of Object.values(working.players)) {
    if (!player.isOnCourt || player.role === 'goalkeeper') continue;
    if (player.team === defendingTeam) initialDefenderPositions.set(player.id, { ...player.position });
    if (player.team === attackingTeam) initialAttackerPositions.set(player.id, { ...player.position });
  }

  const runs: RunOrder[] = attack.orders.map((order) => ({ order, done: false }));
  const moved = new Map<string, number>();
  const defenseMoved = new Map<string, number>();
  const track = (log: Map<string, number>, id: string, meters: number): void => {
    log.set(id, (log.get(id) ?? 0) + meters);
  };

  let flightRef: { current: Flight | null } = { current: null };
  let conditionalUsed = false;
  let endedEarly = false;
  let endReason: VolleyResult['endReason'] = 'duration';
  let possessionChanged = false;
  let elapsed = 0;

  const finish = (reason: VolleyResult['endReason']): void => {
    endReason = reason;
    endedEarly = true;
  };

  // Emission d'une passe (ordre principal ou conditionnel). La ligne de passe
  // est lue au moment de la passe, avec la doctrine defensive verrouillee.
  const emitPass = (order: VolleyOrder): 'skip' | 'hand' | 'intercepted' | 'in-flight' => {
    if (working.ball.holderId !== order.actorId) return 'skip';
    const passer = working.players[order.actorId]!;
    const receiver = order.targetId ? working.players[order.targetId] : undefined;
    if (!receiver) return 'skip';
    const lane = passLaneContest(working, attackingTeam, passer.position, receiver.position);
    const total = dist(passer.position, receiver.position);
    if (total < 0.5) {
      working.ball.holderId = receiver.id;
      working.ball.position = { ...receiver.position };
      appendEvent(working, {
        timeSeconds: working.timeSeconds, type: 'pass', actorId: passer.id, targetId: receiver.id,
        result: 'completed', causes: ['main a main']
      });
      return 'hand';
    }
    if (random.next() < lane.value * 0.5) {
      const interceptor = lane.defenderId ? working.players[lane.defenderId] : undefined;
      const taker = interceptor ?? receiver;
      working.ball.holderId = taker.id;
      working.ball.position = { ...taker.position };
      appendEvent(working, {
        timeSeconds: working.timeSeconds, type: 'pass', actorId: passer.id, targetId: receiver.id,
        result: 'intercepted',
        causes: [`ligne de passe fermee ${(lane.value * 100).toFixed(0)} %`, ...(lane.defenderId ? [`lu par ${lane.defenderId}`] : [])]
      });
      possessionChanged = true;
      finish('turnover');
      return 'intercepted';
    }
    flightRef.current = { passerId: passer.id, receiverId: receiver.id, remaining: total, total };
    appendEvent(working, {
      timeSeconds: working.timeSeconds, type: 'pass', actorId: passer.id, targetId: receiver.id,
      result: 'in flight', causes: [`ligne de passe fermee ${(lane.value * 100).toFixed(0)} %`]
    });
    return 'in-flight';
  };

  // Tir : declenche par la geometrie (portee), conteste par le plan defensif
  // aveugle du defenseur le plus proche, jamais par une reaction.
  const attemptShot = (order: VolleyOrder): boolean => {
    if (working.ball.holderId !== order.actorId) return false;
    const shooter = working.players[order.actorId]!;
    if (distanceToGoal(shooter.position, attackingTeam) > SHOT_RANGE) return false;
    const contesting = nearestDefenderOf(working, defendingTeam, shooter.position, 3);
    const contestOrder = contesting ? defenseByActor.get(contesting.id) : undefined;
    const intent: ActionIntent = {
      type: 'shoot',
      actorId: shooter.id,
      shotType: order.shotType ?? 'jump',
      shotSide: order.shotSide ?? 'center',
      shotHeight: order.shotHeight ?? 'middle'
    };
    if (contesting && contestOrder) {
      intent.contestedBy = contesting.id;
      intent.contestAction = contestOrder.kind === 'contain' || contestOrder.kind === 'help'
        ? 'block-shot'
        : contestOrder.kind === 'pressBall' ? 'press' : 'none';
    }
    const shot = resolveAction(working, intent, random);
    absorb(working, shot.state);
    if (working.teams[attackingTeam].possession === false) {
      possessionChanged = true;
      const restart = shot.event.result === 'goal' ? 'centre' : shot.event.result === 'save' ? 'goalkeeper' : 'interception';
      absorb(working, installPossession(working, other(attackingTeam), restart));
    }
    finish(shot.event.result === 'goal' ? 'goal' : shot.event.result === 'save' ? 'save' : 'shot');
    return true;
  };

  // Boucle de simulation : 3 a 5 s a tick strict (spec 19 §2).
  while (elapsed < MAX_VOLLEY_SECONDS - 1e-9) {
    // 1. Ordres offensifs : deplacement, declencheurs par la geometrie.
    for (const run of runs) {
      if (run.done) continue;
      const order = run.order;
      if ((order.startAt ?? 0) > elapsed + 1e-9) continue;
      const actor = working.players[order.actorId];
      if (!actor) {
        run.done = true;
        continue;
      }
      if (order.kind === 'pass') {
        const outcome = emitPass(order);
        run.done = outcome !== 'skip';
        if (outcome === 'intercepted') break;
        continue;
      }
      if (order.kind === 'shoot') {
        // Pas encore en portee : on reessaie au prochain tick, l'ordre reste vif.
        if (attemptShot(order)) {
          run.done = true;
          break;
        }
        continue;
      }
      if (order.kind === 'fix') {
        const defender = order.targetId ? working.players[order.targetId] : undefined;
        if (!defender) {
          run.done = true;
          continue;
        }
        const target = order.targetPosition ?? defender.position;
        const before = { ...actor.position };
        actor.position = stepToward(actor.position, target, locomotionSpeed(actor) * TICK * ramp(elapsed));
        track(moved, actor.id, dist(before, actor.position));
        if (working.ball.holderId === actor.id) working.ball.position = { ...actor.position };
        if (dist(actor.position, defender.position) <= FIX_CONTACT) {
          absorb(working, resolveAction(working, { type: 'fix', actorId: actor.id, targetId: defender.id }, random).state);
          run.done = true;
        }
        continue;
      }
      // move, attackSpace, cut, screen, support, stretch : course vers la cible.
      const target = order.targetPosition!;
      const before = { ...actor.position };
      actor.position = stepToward(actor.position, target, locomotionSpeed(actor) * TICK * ramp(elapsed));
      track(moved, actor.id, dist(before, actor.position));
      if (working.ball.holderId === actor.id) working.ball.position = { ...actor.position };
      if (order.kind === 'attackSpace') {
        // Le duel nait de la geometrie : contact + trajectoire vers un espace.
        const defender = nearestDefenderOf(working, defendingTeam, actor.position, DUEL_CONTACT);
        if (defender) {
          const duelOrder = defenseByActor.get(defender.id);
          const gap = observeDynamicGaps(working, attackingTeam)
            .filter((entry) => entry.defenders.includes(defender.id))
            .sort((first, second) => Math.abs(first.window) - Math.abs(second.window))[0];
          const window = gap ? gap.window : 0;
          const intent: ActionIntent = {
            type: 'duel',
            actorId: actor.id,
            targetId: defender.id,
            contestedBy: defender.id,
            contestAction: duelOrder
              ? duelOrder.kind === 'pressBall' ? 'press' : duelOrder.kind === 'deny' ? 'intercept' : duelOrder.kind === 'help' ? 'help' : 'contain'
              : 'contain',
            defenseDecision: DEFENSE_TO_DUEL[duelOrder?.kind ?? 'hold'],
            // Initiative temporelle locale (D-019) : qui ferme la fenetre le
            // premier pese plus fort, pas un bonus global de vitesse.
            orderScale: window <= 0 ? 1.35 : window >= 0.5 ? 0.7 : 1
          };
          const duel = resolveAction(working, intent, random);
          absorb(working, duel.state);
          if (!['won', 'foul-defense'].includes(duel.event.result)) run.done = true;
        }
      }
      if (dist(actor.position, target) < 0.15) run.done = true;
    }
    if (endedEarly) {
      break;
    }

    // 2. Conditionnel (au plus un, spec 19 §4) : declencheurs simples.
    if (attack.conditional && !conditionalUsed) {
      const conditional = attack.conditional;
      let triggered = false;
      if (conditional.trigger === 'defender-steps') {
        const actor = working.players[conditional.actorId];
        const defender = actor ? nearestDefenderOf(working, defendingTeam, actor.position, Infinity) : undefined;
        triggered = !!defender && dist(defender.position, initialDefenderPositions.get(defender.id) ?? defender.position) > 2.2;
      } else if (conditional.trigger === 'gap-opens') {
        triggered = observeDynamicGaps(working, attackingTeam).some((entry) => entry.window >= 0.45);
      }
      if (triggered) {
        conditionalUsed = true;
        const order = conditional.order;
        if (order.kind === 'pass') {
          if (emitPass(order) === 'intercepted') break;
        } else if (order.kind === 'shoot') {
          if (attemptShot(order)) break;
        } else if (order.targetPosition) {
          runs.push({ order: { ...order, startAt: 0 }, done: false });
        }
      }
    }
    if (endedEarly) {
      break;
    }

    // 3. Defense : doctrines verrouillees, coulissement plafonne. La defense
    // ne lit jamais le plan offensif (spec 19 §7) : elle suit le ballon, son
    // vis-a-vis assigne au verrouillage, et choisit ce qu'elle concede.
    for (const defender of Object.values(working.players)) {
      if (defender.team !== defendingTeam || !defender.isOnCourt || defender.role === 'goalkeeper') continue;
      // Un defenseur battu ne presse plus et coulisse ralenti (etat conquis).
      if ((defender.beatenUntil ?? 0) > state.timeSeconds + elapsed) continue;
      const order = defenseByActor.get(defender.id);
      const kind: DefenseVolleyIntent = order?.kind ?? 'hold';
      if (kind === 'hold') continue;
      const cap = order?.maxDisplacement ?? DEFAULT_MAX_DISPLACEMENT[kind];
      const used = defenseMoved.get(defender.id) ?? 0;
      if (used >= cap - 1e-9) continue;
      const holder = working.players[working.ball.holderId];
      if (!holder) continue;
      let target: Vector2 | null = null;
      if (kind === 'shift' || kind === 'pressBall') {
        target = holder.position;
      } else if (kind === 'help') {
        const goalX = defender.team === 'nangis' ? 0 : 40;
        target = { x: (holder.position.x + goalX) / 2, y: (holder.position.y + 10) / 2 };
      } else if (kind === 'deny') {
        // Fermer la ligne vers le coequipier le plus menacant visible : le
        // receveur potentiel le plus proche du porteur (aucune triche).
        const receiver = Object.values(working.players)
          .filter((player) => player.team === attackingTeam && player.isOnCourt && player.role !== 'goalkeeper' && player.id !== holder.id)
          .sort((first, second) => dist(first.position, holder.position) - dist(second.position, holder.position))[0];
        target = receiver ? { x: (holder.position.x + receiver.position.x) / 2, y: (holder.position.y + receiver.position.y) / 2 } : holder.position;
      } else if (kind === 'contain') {
        const assignment = Object.entries(initialAttackerPositions)
          .map(([id, position]) => ({ id, d: dist(position, initialDefenderPositions.get(defender.id) ?? defender.position) }))
          .sort((first, second) => first.d - second.d)[0];
        const assigned = assignment ? working.players[assignment.id] : undefined;
        const goalX = defender.team === 'nangis' ? 0 : 40;
        target = assigned ? { x: (assigned.position.x + goalX) / 2, y: (assigned.position.y + 10) / 2 } : holder.position;
      }
      if (!target) continue;
      const step = Math.min(locomotionSpeed(defender) * TICK * ramp(elapsed), cap - used);
      const before = { ...defender.position };
      defender.position = stepToward(defender.position, target, step);
      track(defenseMoved, defender.id, dist(before, defender.position));
    }

    // 4. Ballon en vol.
    const flight = flightRef.current;
    if (flight) {
      flight.remaining -= PASS_SPEED * TICK;
      const passer = working.players[flight.passerId]!;
      const receiver = working.players[flight.receiverId]!;
      const travelled = Math.max(0, Math.min(1, 1 - flight.remaining / flight.total));
      working.ball.position = {
        x: passer.position.x + (receiver.position.x - passer.position.x) * travelled,
        y: passer.position.y + (receiver.position.y - passer.position.y) * travelled
      };
      if (flight.remaining <= 0) {
        working.ball.holderId = receiver.id;
        working.ball.position = { ...receiver.position };
        const dropChance = Math.max(0, (65 - receiver.reception) / 250);
        if (random.next() < dropChance) {
          appendEvent(working, {
            timeSeconds: working.timeSeconds, type: 'pass', actorId: passer.id, targetId: receiver.id,
            result: 'dropped', causes: ['reception ratee']
          });
          possessionChanged = true;
          finish('turnover');
          break;
        }
        appendEvent(working, {
          timeSeconds: working.timeSeconds, type: 'pass', actorId: passer.id, targetId: receiver.id,
          result: 'completed', causes: ['reception propre']
        });
        flightRef.current = null;
      }
    }
    if (endedEarly) {
      break;
    }

    elapsed += TICK;
  }
  if (endReason === 'duration') {
    elapsed = MAX_VOLLEY_SECONDS;
  }

  // Couts locomoteurs : l'ardeur de la defense coute plus cher que la course
  // offensive (spec 19 §6 ; fenetre glissante Ardeur en V1).
  for (const [id, meters] of moved) {
    const player = working.players[id];
    if (player) player.energy = Math.max(0, player.energy - meters * ATTACK_ENERGY_COST_PER_METRE);
  }
  for (const [id, meters] of defenseMoved) {
    const player = working.players[id];
    if (player) player.energy = Math.max(0, player.energy - meters * DEFENSE_ENERGY_COST_PER_METRE);
  }

  working.timeSeconds = Number((working.timeSeconds + elapsed).toFixed(3));

  // Lecture finale du siege : faits, pas jauges (spec 19 §6).
  const gaps = observeDynamicGaps(working, attackingTeam);
  const gapCauses = [...gaps]
    .sort((first, second) => second.window - first.window)
    .slice(0, 3)
    .map((gap) => `gap ${gap.id} ${gap.width.toFixed(1)}m fenetre ${gap.window.toFixed(2)}s${gap.exploitable ? ' exploitable' : ''}`);
  appendEvent(working, {
    timeSeconds: working.timeSeconds,
    type: 'volley-end',
    result: endReason,
    causes: [...gapCauses, conditionalUsed ? 'conditionnel joue' : 'sans conditionnel']
  });

  return {
    state: working,
    events: working.events.slice(startEventCount),
    gaps,
    durationSeconds: elapsed,
    endedEarly,
    endReason,
    possessionChanged
  };
}

// Doctrine defensive par defaut pour le sandbox : pression porteur proche,
// containment du vis-a-vis, coulissement leger sinon. L'IA planifie, elle ne
// reagit pas au plan offensif (spec 19 §7).
export function chooseVolleyDefense(state: MatchState, attackingTeam: TeamId): DefensePlan {
  const defendingTeam = other(attackingTeam);
  const holder = state.players[state.ball.holderId];
  const attackers = Object.values(state.players).filter(
    (player) => player.team === attackingTeam && player.isOnCourt && player.role !== 'goalkeeper'
  );
  const orders: DefenseOrder[] = [];
  for (const defender of Object.values(state.players)) {
    if (defender.team !== defendingTeam || !defender.isOnCourt || defender.role === 'goalkeeper') continue;
    const holderDistance = holder ? dist(defender.position, holder.position) : Infinity;
    if (holderDistance <= 4) {
      orders.push({ actorId: defender.id, kind: 'pressBall' });
      continue;
    }
    const assignmentDistance = attackers.length
      ? Math.min(...attackers.map((attacker) => dist(attacker.position, defender.position)))
      : Infinity;
    orders.push(
      assignmentDistance <= 4
        ? { actorId: defender.id, kind: 'contain' }
        : { actorId: defender.id, kind: 'shift', maxDisplacement: 2 }
    );
  }
  return { team: defendingTeam, orders };
}

