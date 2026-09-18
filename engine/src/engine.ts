import { SeededRandom } from './random.js';
import { createPilotMatch } from './match.js';
import { shotContext, attackingDirection } from './court.js';
import { observeIntervals, passLaneContest } from './spatial.js';
import { defensivePressure } from './defense.js';
import { goalkeeperAdvantage, mentalSwing } from './goalkeeper.js';
import { referenceDefenderId } from './formation.js';
import type { ActionIntent, ActionResolution, MatchEvent, MatchState, Situation, TeamId, Vector2 } from './types.js';

// Portee de tir credible, en metres effectifs (distance + angle). Au dela,
// aucun tir n est propose.
export const SHOOTING_RANGE = 15;

// Bonus / malus de chaque geste de tir par poste (docs 01 §29-35, 03 §1,
// 13 S48-13, 14 phases A/C). Le tir n'est plus un jet unique : un ailier en
// extension a 6 m n'a rien a voir avec un arriere en appui a 10 m.
interface ShotProfileDef { label: string; power: number; wingBonus: number; backBonus: number; pivotBonus: number; needsSpace: boolean }
const SHOT_PROFILES: Record<string, ShotProfileDef> = {
  // Tir en suspension : geste de l'arriere qui s'eleve au-dessus du bloc.
  jump: { label: 'tir en suspension', power: 4, wingBonus: 0, backBonus: 6, pivotBonus: 0, needsSpace: true },
  // Tir en appui : puissance pure apres elan, geste d'Erwan sur S44-01.
  standing: { label: 'tir en appui', power: 2, wingBonus: -2, backBonus: 6, pivotBonus: 2, needsSpace: true },
  // Tir en extension : geste de l'ailier qui s'ecarte pour ouvrir l'angle.
  // Malone, Pierre, Elian : sans extension, l'aile a angle ferme est injouable.
  extension: { label: 'tir en extension', power: 0, wingBonus: 10, backBonus: -4, pivotBonus: -2, needsSpace: false },
  placed: { label: 'tir place', power: 1, wingBonus: 3, backBonus: 1, pivotBonus: 3, needsSpace: false },
  power: { label: 'tir en puissance', power: 3, wingBonus: -1, backBonus: 4, pivotBonus: 4, needsSpace: true },
  lob: { label: 'lob', power: -1, wingBonus: 4, backBonus: -3, pivotBonus: 5, needsSpace: false },
  roucoulette: { label: 'roucoulette', power: 0, wingBonus: 8, backBonus: -2, pivotBonus: 2, needsSpace: false },
  chabala: { label: 'chabala', power: 1, wingBonus: 5, backBonus: 0, pivotBonus: 4, needsSpace: false }
};

export function shotProfile(type: string): ShotProfileDef {
  const found = SHOT_PROFILES[type];
  if (found) return found;
  return { label: 'tir place', power: 1, wingBonus: 3, backBonus: 1, pivotBonus: 3, needsSpace: false };
}

function distance(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

// Pas borne : aucun deplacement instantane ne depasse maxStep metres.
// La decision (assignation, pression, echange de roles) s applique aussitot,
// le corps suit par trajectoire continue (doc 17, ecart E-003).
function stepToward(position: Vector2, target: Vector2, maxStep: number): Vector2 {
  const remaining = Math.hypot(target.x - position.x, target.y - position.y);
  if (remaining <= maxStep || remaining === 0) {
    return { ...target };
  }
  const ratio = maxStep / remaining;
  return {
    x: position.x + (target.x - position.x) * ratio,
    y: position.y + (target.y - position.y) * ratio
  };
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
  const sorted = Object.values(state.players)
    .filter((player) => player.team === opposingTeam(team) && player.isOnCourt && player.role !== 'goalkeeper')
    .sort((first, second) => distance(first.position, state.ball.position) - distance(second.position, state.ball.position));
  if (sorted.length === 0) {
    return;
  }
  const opponent = sorted[0] as (typeof sorted)[number];
  state.ball.holderId = opponent.id;
  state.ball.position = { ...opponent.position };
  state.teams[team].possession = false;
  state.teams[opposingTeam(team)].possession = true;
}

export function getSituation(state: MatchState): Situation {
  const holder = state.players[state.ball.holderId];
  if (!holder) {
    throw new Error(`Unknown ball holder ${state.ball.holderId}`);
  }
  const opponents = Object.values(state.players).filter((player) => player.team !== holder.team && player.isOnCourt && player.role !== 'goalkeeper');
  const orderedOpponents = opponents.sort((first, second) => distance(first.position, holder.position) - distance(second.position, holder.position));
  const closestOpponent = orderedOpponents.length > 0 ? orderedOpponents[0] as (typeof orderedOpponents)[number] : undefined;
  // Les quatre partenaires les plus proches deviennent les options de passe,
  // pas les quatre premiers de l effectif.
  const teammates = Object.values(state.players)
    .filter((player) => player.team === holder.team && player.id !== holder.id && player.isOnCourt && player.role !== 'goalkeeper')
    .sort((first, second) => distance(first.position, holder.position) - distance(second.position, holder.position));
  const availableActions: ActionIntent[] = teammates.slice(0, 4).map((player) => ({ type: 'pass', actorId: holder.id, targetId: player.id }));
  // Gates geometriques (doc 18 §3.2, retour de test §1.3/§1.15) : un duel, un
  // dribble ou une fixation n'a de sens qu'au contact du vis-a-vis de
  // reference — pas a 20 m du defenseur le plus proche par hasard.
  const referenceDefender = (() => {
    const referenceId = referenceDefenderId(state, holder.id);
    return referenceId ? state.players[referenceId] : closestOpponent;
  })();
  const referenceDistance = referenceDefender ? distance(holder.position, referenceDefender.position) : Infinity;
  const intervals = observeIntervals(state, holder.team);
  const openIntervalAhead = intervals.some((interval) => interval.openness > 0.45);
  if (referenceDefender && referenceDistance <= 3.5) {
    availableActions.push({ type: 'duel', actorId: holder.id, targetId: referenceDefender.id });
  }
  // Dribble (balle au sol) : une seule prise de dribble, reprise interdite.
  if (referenceDefender && referenceDistance <= 4 && !holder.dribbling) {
    // Dribble : reprise balle en main pour changer de rythme et de direction
    // (doc 01 §4 : dribble distinct du duel). Moins d'engagement qu'un duel :
    // on garde le ballon meme en echec, mais on ne bat personne.
    availableActions.push({ type: 'dribble', actorId: holder.id, targetId: referenceDefender.id });
  }
  // Fixer = attaquer l'intervalle pour provoquer la fermeture et liberer
  // l'autre espace (doc 18 §1.12) : il faut un intervalle devant soi.
  if (referenceDefender && referenceDistance <= 4.5 && openIntervalAhead) {
    availableActions.push({ type: 'fix', actorId: holder.id, targetId: referenceDefender.id });
  }
  // Croise : permutation de couloirs, proposee seulement quand le porteur
  // n'est pas sous contact immediat (doc 18 §1.15).
  const crossTarget = teammates.find(
    (player) => (player.role === 'back' || player.role === 'center') && Math.abs(player.position.y - holder.position.y) >= 4
  );
  if (crossTarget && referenceDistance >= 3) {
    availableActions.push({ type: 'cross', actorId: holder.id, targetId: crossTarget.id });
  }
  // Deplacements du porteur (doc 01 §4) : avancer, diagonale interieure,
  // decalage exterieur. La course construit l elan du tir en appui.
  const attackSign = holder.team === 'nangis' ? 1 : -1;
  const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
  // Regle du marcher (O-008, doc 18 §3.3) : balle en main, 3 pas sans dribble.
  // Une course de porteur consomme son budget de pas ; au-dela, il faut mettre
  // la balle au sol (dribble) avant de courir a nouveau.
  const stepsUsed = holder.stepsWithoutDribble ?? 0;
  const advanceCost = 3;
  const lateralCost = 2;
  const canAdvance = holder.dribbling === true || stepsUsed + advanceCost <= 3;
  const canLateral = holder.dribbling === true || stepsUsed + lateralCost <= 3;
  const advanceTarget = { x: clamp(holder.position.x + attackSign * 3, 1, 39), y: holder.position.y };
  const insideTarget = {
    x: clamp(holder.position.x + attackSign * 2, 1, 39),
    y: clamp(holder.position.y + (holder.position.y <= 10 ? 2.5 : -2.5), 1, 19)
  };
  const outsideTarget = { x: holder.position.x, y: clamp(holder.position.y + (holder.position.y <= 10 ? -3 : 3), 1, 19) };
  if (canAdvance) {
    availableActions.push({ type: 'run', actorId: holder.id, targetPosition: advanceTarget, runKind: 'advance' });
    availableActions.push({ type: 'run', actorId: holder.id, targetPosition: insideTarget, runKind: 'diagonal' });
  }
  if (canLateral) {
    availableActions.push({ type: 'run', actorId: holder.id, targetPosition: outsideTarget, runKind: 'lateral' });
  }
  // Le tir n est propose que depuis une distance credible, mesuree en distance
  // effective (axiale + angle). Un ailier excentre a 8 m axiaux peut etre hors
  // portee quand un arriere plein axe a 12 m reste dedans (docs 01, 03, 14).
  // Le geste propose depend du poste : extension pour l'ailier, suspension ou
  // appui pour l'arriere, place ou chabala pour le pivot.
  if (shotContext(holder.position, holder.team).effectiveDistance <= SHOOTING_RANGE) {
    const wingShot: ActionIntent['shotType'] = 'extension';
    const backShot: ActionIntent['shotType'] = (holder.momentum ?? 0) >= 30 ? 'standing' : 'jump';
    const pivotShot: ActionIntent['shotType'] = 'placed';
    const defaultShot: ActionIntent['shotType'] =
      holder.role === 'wing' ? wingShot : holder.role === 'back' ? backShot : holder.role === 'pivot' ? pivotShot : 'placed';
    availableActions.push({ type: 'shoot', actorId: holder.id, shotType: defaultShot });
    // L'ailier garde une roucoulette de rechange, l'arriere un tir place :
    // deux gestes, pas vingt boutons (doc 05 §108).
    if (holder.role === 'wing') {
      availableActions.push({ type: 'shoot', actorId: holder.id, shotType: 'roucoulette' });
    } else if (holder.role === 'back' || holder.role === 'center') {
      availableActions.push({ type: 'shoot', actorId: holder.id, shotType: 'placed' });
    }
  }
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
    // Reponse defensive annoncee : le defenseur qui conteste pese dans le duel
    // (doc 00 : si l'adversaire a anticipe au bon moment, c'est bon).
    const contestBonus = action.contestedBy === opponent.id
      ? action.contestAction === 'press' ? 14
      : action.contestAction === 'help' ? 18
      : action.contestAction === 'retreat' ? -10
      : action.contestAction === 'none' ? -6 : 6
      : 0;
    const beatenBonus = (opponent.beatenUntil ?? 0) > nextState.timeSeconds ? 25 : 0;
    const advantage = actor.duel + actor.acceleration + actor.confidence / 2 - opponent.defense - opponent.anticipation / 2 - defensivePressureValue / 2 + intentionModifier(action.intention) + (actor.momentum ?? 0) * 0.08 + beatenBonus - contestBonus;
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
      causes: success
        ? [...(action.contestedBy ? ['defensive contest beaten'] : ['first step', 'acceleration']), 'space', action.intention === 'attack-inside' ? 'inside interval' : action.intention === 'attack-outside' ? 'outside interval' : 'interval taken']
        : [...(action.contestedBy ? ['defensive contest held'] : ['defensive anticipation', 'help coverage']), 'fatigue']
    });
    actor.pressure = success ? Math.max(0, actor.pressure - 8) : Math.min(100, actor.pressure + 10);
    if (success) {
      // Duel gagne = acces au but (doc 01 §4, doc 12) : le defenseur est
      // battu 6 secondes, recule et ne presse plus. L'attaquant avance vers
      // l'intervalle choisi, pas d'un pas generique sur x.
      const inside = action.intention !== 'attack-outside';
      const lateral = actor.position.y <= 10 ? 1.5 : -1.5;
      actor.position = {
        x: actor.position.x + (actor.team === 'nangis' ? 2.5 : -2.5),
        y: Math.max(1, Math.min(19, actor.position.y + (inside ? lateral : -lateral)))
      };
      opponent.position = {
        x: opponent.position.x + (actor.team === 'nangis' ? -1.5 : 1.5),
        y: opponent.position.y
      };
      opponent.beatenUntil = nextState.timeSeconds + 6;
      opponent.pressure = Math.min(100, opponent.pressure + 12);
      nextState.ball.position = { ...actor.position };
    }
    return { state: nextState, event };
  }

  // Dribble : changement de rythme et de direction balle en main. On ne bat
  // personne, mais on se decale d'un pas et on fait reculer la pression d'un
  // cran (doc 01 §4 : dribble, changement de direction, changement de rythme).
  if (action.type === 'dribble') {
    if (!opponent) {
      throw new Error('A dribble target must be an opponent');
    }
    const advantage = actor.duel * 0.6 + actor.acceleration * 0.8 + actor.confidence / 3 - opponent.defense * 0.7 - opponent.anticipation / 3 + intentionModifier(action.intention);
    const success = random.chance((advantage + 100) / 200);
    const lateral = actor.position.y <= 10 ? -2 : 2;
    if (success) {
      actor.position = {
        x: actor.position.x + (actor.team === 'nangis' ? 1.5 : -1.5),
        y: Math.max(1, Math.min(19, actor.position.y + lateral))
      };
      nextState.ball.position = { ...actor.position };
      actor.pressure = Math.max(0, actor.pressure - 6);
      actor.momentum = Math.min(100, (actor.momentum ?? 0) + 15);
    } else {
      actor.pressure = Math.min(100, actor.pressure + 4);
    }
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'dribble',
      actorId: actor.id,
      targetId: opponent.id,
      result: success ? 'shifted' : 'held',
      causes: success ? ['change of pace', 'change of direction', 'defender on heels'] : ['defender balance', 'no space taken']
    });
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
    // Ecran borne : le bloqueur avance vers le point d ecran par pas de
    // 3,5 m, jamais teleporte (doc 17, ecart E-003).
    const screenPoint = { x: opponent.position.x, y: opponent.position.y + (actor.position.y < 10 ? -1 : 1) };
    actor.position = stepToward(actor.position, screenPoint, 3.5);
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
  // Croise visible et jouable (docs 00 S44-01, 01 §1, 05 passe-et-va) :
  // les deux coureurs echangent vraiment leurs couloirs — chacun vise le
  // couloir actuel de l'autre, en convergant sur le meme axe x. Par pas bornes
  // de 3,5 m. Le porteur garde le ballon et peut tirer ou passer derriere ;
  // la defense doit suivre ou changer.
  const sharedX = (actor.position.x + target.position.x) / 2;
  const actorGoal = { x: sharedX, y: target.position.y };
  const targetGoal = { x: sharedX, y: actor.position.y };
  actor.position = stepToward(actor.position, actorGoal, 3.5);
  target.position = stepToward(target.position, targetGoal, 3.5);
    if (actor.id === nextState.ball.holderId) {
      nextState.ball.position = { ...actor.position };
    }
    actor.momentum = Math.min(100, (actor.momentum ?? 0) + 10);
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
      // Regle du marcher (O-008, doc 18 §3.3) : balle en main, 3 pas sans
      // dribble. Chaque course de porteur consomme des pas ; si le budget est
      // depasse, la balle est a mettre au sol (dribble) avant de courir a
      // nouveau.
      const runCost = Math.abs(action.targetPosition.y - actor.position.y) < 0.5 ? 3 : 2;
      actor.stepsWithoutDribble = (actor.stepsWithoutDribble ?? 0) + runCost;
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
    const markPoint = {
      x: Math.max(0.5, Math.min(39.5, opponent.position.x - attackingDirection(actor.team) * 1.3)),
      y: Math.max(1, Math.min(19, opponent.position.y))
    };
    // L affectation et la pression sont immediates (decision), le corps
    // rejoint le point de marquage par pas bornes (doc 17, ecart E-003).
    actor.position = stepToward(actor.position, markPoint, 3.5);
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
    // Aide bornee : le defenseur fond vers le porteur par pas de 3,5 m,
    // jamais teleporte (doc 17, ecart E-003).
    const helpPoint = { x: opponent.position.x + (actor.team === 'nangis' ? -1 : 1), y: opponent.position.y };
    actor.position = stepToward(actor.position, helpPoint, 3.5);
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

  // Sortie : le defenseur monte agressivement sur le porteur pour le forcer
  // a decider vite (doc 03 §1 : sortir). Monte la pression, ouvre derriere.
  if (action.type === 'press') {
    if (!opponent) {
      throw new Error('A press target must be an opponent');
    }
    const pressPoint = { x: opponent.position.x + (actor.team === 'nangis' ? -0.8 : 0.8), y: opponent.position.y };
    actor.position = stepToward(actor.position, pressPoint, 3.5);
    opponent.pressure = Math.min(100, opponent.pressure + 16);
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'defensive-press',
      actorId: actor.id,
      targetId: opponent.id,
      result: 'applied',
      causes: ['aggressive exit', 'decision forced', 'space opened behind']
    });
    return { state: nextState, event };
  }

  // Repli : le defenseur recule vers son but et concede le tir lointain pour
  // proteger l'intervalle (doc 03 §1 : reculer).
  if (action.type === 'retreat') {
    const goalX = actor.team === 'nangis' ? 0 : 40;
    const retreatPoint = { x: goalX + (actor.team === 'nangis' ? 7 : -7), y: 10 };
    actor.position = stepToward(actor.position, retreatPoint, 3.5);
    if (opponent) {
      opponent.pressure = Math.max(0, opponent.pressure - 8);
    }
    const retreatTarget = opponent ? opponent.id : actor.id;
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'defensive-retreat',
      actorId: actor.id,
      targetId: retreatTarget,
      result: 'held',
      causes: ['protect interval', 'concede distance', 'block set']
    });
    return { state: nextState, event };
  }

  // Interception : le defenseur tente de couper la ligne de passe lue
  // (doc 03 §1 : anticiper la passe). Risque : si ca rate, il est efface.
  if (action.type === 'intercept') {
    if (!opponent) {
      throw new Error('An intercept target must be an opponent');
    }
    const advantage = actor.anticipation + actor.defense / 2 - opponent.passing * 0.5 - distance(actor.position, opponent.position) * 4;
    const success = random.chance((advantage + 60) / 160);
    if (success) {
      actor.position = stepToward(actor.position, opponent.position, 3.5);
      transferToOpponent(nextState, opponent.team);
      const event = appendEvent(nextState, {
        timeSeconds: nextState.timeSeconds,
        type: 'interception',
        actorId: actor.id,
        targetId: opponent.id,
        result: 'stolen',
        causes: ['pass read', 'lane anticipated', 'timing']
      });
      return { state: nextState, event };
    }
    actor.position = {
      x: actor.position.x + (actor.team === 'nangis' ? 1.5 : -1.5),
      y: actor.position.y
    };
    actor.beatenUntil = nextState.timeSeconds + 5;
    const event = appendEvent(nextState, {
      timeSeconds: nextState.timeSeconds,
      type: 'interception',
      actorId: actor.id,
      targetId: opponent.id,
      result: 'beaten',
      causes: ['wrong read', 'defender eliminated', 'space opened']
    });
    return { state: nextState, event };
  }

  if (action.type === 'shoot') {
    const goalkeeperId = findGoalkeeper(nextState, opposingTeam(actor.team));
    const keeperEntry = goalkeeperId ? nextState.players[goalkeeperId] : undefined;
    if (!nextState.teams[opposingTeam(actor.team)].sevenPlayer && !keeperEntry) {
      throw new Error(`No goalkeeper for ${opposingTeam(actor.team)}`);
    }
    const goalkeeper = keeperEntry;
    // Distance effective : axiale + penalite d'angle. Un ailier excentre paie
    // son angle ferme, un arriere plein axe garde sa portee (docs 01, 03, 14).
    const context = shotContext(actor.position, actor.team);
    const shotType = action.shotType ?? (actor.role === 'wing' ? 'extension' : actor.role === 'back' ? 'jump' : 'placed');
    const profile = shotProfile(shotType);
    const roleBonus = actor.role === 'wing' ? profile.wingBonus : actor.role === 'back' ? profile.backBonus : actor.role === 'pivot' ? profile.pivotBonus : 1;
    // Espace conquis : un defenseur battu ou un intervalle ouvert vaut de l'or.
    const intervals = observeIntervals(state, actor.team);
    const opennessValues = intervals.map((interval) => interval.openness);
    const openness = opennessValues.length > 0 ? Math.max(...opennessValues) : 0.5;
    const beatenNearby = Object.values(nextState.players).some(
      (player) => player.team !== actor.team && player.isOnCourt && (player.beatenUntil ?? 0) > nextState.timeSeconds && distance(player.position, actor.position) < 5
    );
    const spaceBonus = openness * 10 + (beatenNearby ? 12 : 0);
    // Tir en appui : l elan pris en course alimente la puissance (doc 17, E-002).
    const momentum = actor.momentum ?? 0;
    const momentumBonus = momentum * (shotType === 'placed' ? 0.12 : 0.06);
    // Un geste qui demande de l'espace (suspension, appui, puissance) sous
    // forte pression perd de sa valeur : il faut etre lance ou decale.
    const contestedMalus = profile.needsSpace ? Math.max(0, actor.pressure - 40) * 0.25 : 0;
    const shootingPower = actor.shooting + profile.power + roleBonus + spaceBonus - context.effectiveDistance * 0.7 - actor.pressure * 0.3 + intentionModifier(action.intention) + momentumBonus - contestedMalus;
    const savePower = goalkeeper ? goalkeeper.goalkeeper + goalkeeper.anticipation * 0.35 : 0;
    // P2 — le duel tireur-gardien se joue sur la ZONE visee : le gardien lit
    // cote + hauteur (chooseGoalkeeperRead), bonus si lecture juste, malus si
    // pris a contre-pied. Seul apres duel gagne, le tireur impose son rythme.
    const shotZone = { side: action.shotSide ?? 'center' as const, height: action.shotHeight ?? 'middle' as const };
    const goalkeeperRead = goalkeeper ? goalkeeperAdvantage(nextState, goalkeeper.team, actor.id, {
      type: shotType,
      side: shotZone.side,
      height: shotZone.height,
      power: actor.shooting
    }, { aloneAfterBeaten: beatenNearby }) : 0;
    // P2 — memoire des zones : le gardien apprend ou ce tireur vise vraiment.
    // Prochain tir dans la meme zone = anticipation possible (doc 03, 14).
    if (goalkeeper) {
      const zoneKey = `shoot-zone:${shotZone.side}:${shotZone.height}`;
      const previous = nextState.memory.patterns[zoneKey];
      nextState.memory.patterns[zoneKey] = {
        key: zoneKey,
        occurrences: (previous?.occurrences ?? 0) + 1,
        confidence: Math.min(1, (previous?.confidence ?? 0) + 0.15),
        lastSeenAt: nextState.timeSeconds
      };
    }
    // Reponse defensive sur le tir : un bloc monte au bon moment fait chuter
    // le tir (doc 00 : bloc au bon moment). Le repli concede le tir lointain.
    const contestShootBonus = action.contestedBy
      ? action.contestAction === 'block-shot' ? 16
      : action.contestAction === 'press' ? 10
      : action.contestAction === 'help' ? 12
      : action.contestAction === 'retreat' ? -8
      : action.contestAction === 'none' ? -6 : 4
      : 0;
    const goal = random.chance((shootingPower - savePower - goalkeeperRead - contestShootBonus + 100) / 200);
    // Le repli concede par le defenseur se trace dans les deux issues : c est
    // lui qui a ouvert la distance (doc 00 : la reponse defensive se lit).
    const retreatCause = action.contestAction === 'retreat' ? ['retreat conceded'] : [];
    const eventData: Omit<MatchEvent, 'id'> = {
      timeSeconds: nextState.timeSeconds,
      type: 'shoot',
      actorId: actor.id,
      result: goal ? 'goal' : 'save',
      causes: goal
        ? [profile.label, actor.role === 'wing' ? 'wing angle managed' : actor.role === 'back' ? 'back range' : actor.role === 'pivot' ? 'pivot close range' : 'close range', beatenNearby ? 'alone after duel won' : openness > 0.5 ? 'open interval' : 'shot quality', momentum >= 40 ? 'run-up momentum' : 'timing', `zone ${shotZone.side}-${shotZone.height}`, ...retreatCause]
        : [action.contestedBy ? 'defensive block timing' : `goalkeeper read zone ${shotZone.side}-${shotZone.height}`, actor.role === 'wing' && shotType !== 'extension' && shotType !== 'roucoulette' ? 'closed angle' : 'pressure', 'shot distance', ...(momentum >= 40 ? ['run-up momentum faded'] : []), ...retreatCause]
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
    // Deplacement demande borne : trajectoire continue, jamais de saut.
    // Si le porteur se deplace, le ballon suit (doc 17, ecart E-002).
    actor.position = stepToward(actor.position, action.targetPosition, 3.5);
    if (actor.id === nextState.ball.holderId) {
      nextState.ball.position = { ...actor.position };
    }
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

// Options defensives du coach (doc 17, ecart E-001 + mandat pilote-sim) : le
// marquage strict, l'aide, la sortie, le repli et l'interception sont des
// decisions, pas des automatismes. L interface consomme ces intents et les
// joue par playAction, sans rien recoder.
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
  const focused = focus && focus.team === defendingTeam && focus.role !== 'goalkeeper' && focus.isOnCourt ? focus : undefined;
  const defender = focused ?? defenders[0];
  if (!defender) {
    return [];
  }
  const intents: ActionIntent[] = [];
  // Proximite d'abord (docs 00 et 13 : chaque consigne a une distance de sens).
  // Pres du porteur : marquer, aider, couper la ligne. Loin : la seule consigne
  // individuelle valable est le repli vers son but. Une option offre a 20 m du
  // porteur n'a aucun sens de handball.
  const holderDistance = distance(defender.position, holder.position);
  if (holderDistance <= 6) {
    intents.push({ type: 'mark', actorId: defender.id, targetId: holder.id });
    intents.push({ type: 'help', actorId: defender.id, targetId: holder.id });
    intents.push({ type: 'intercept', actorId: defender.id, targetId: holder.id });
    if (holderDistance <= 4) {
      intents.push({ type: 'press', actorId: defender.id, targetId: holder.id });
    }
  } else {
    intents.push({ type: 'retreat', actorId: defender.id, targetId: holder.id });
  }
  return intents;
}

// Reponse defensive automatique : quand l'attaque choisit duel ou tir, le
// defenseur le plus proche conteste (doc 00 : gardien ou bloc au bon moment).
// L'interface appelle contestAction avant playAction pour laisser le coach
// defendre ; l'IA et la simulation l'appliquent d'office.
export function contestAction(state: MatchState, action: ActionIntent): ActionIntent {
  if (action.type !== 'duel' && action.type !== 'shoot' && action.type !== 'dribble' && action.type !== 'pass') {
    return action;
  }
  if (action.contestedBy) return action;
  const actor = state.players[action.actorId];
  if (!actor) return action;
  const defendingTeam = opposingTeam(actor.team);
  const reference = actor.position;
  const candidates = Object.values(state.players)
    .filter((player) => player.team === defendingTeam && player.isOnCourt && player.role !== 'goalkeeper' && (player.beatenUntil ?? 0) <= state.timeSeconds)
    .sort((first, second) => distance(first.position, reference) - distance(second.position, reference));
  if (candidates.length === 0) return action;
  const defender = candidates[0] as (typeof candidates)[number];
  const holderDistance = distance(defender.position, actor.position);
  if (action.type === 'shoot') {
    const contestShoot = holderDistance <= 3 ? 'block-shot' : holderDistance <= 6 ? 'press' : 'retreat';
    return { ...action, contestedBy: defender.id, contestAction: contestShoot };
  }
  if (action.type === 'pass') {
    const laneTarget = action.targetId ? state.players[action.targetId] : undefined;
    const lane = laneTarget
      ? passLaneContest(state, actor.team, actor.position, laneTarget.position)
      : { value: 0 };
    if (lane.value > 0.55 && holderDistance <= 5) {
      return { ...action, contestedBy: defender.id, contestAction: 'intercept' };
    }
    return action;
  }
  const contestDuel = holderDistance <= 2.5 ? 'press' : holderDistance <= 5 ? 'contain' : 'retreat';
  return { ...action, contestedBy: defender.id, contestAction: contestDuel };
}

export function simulatePilotSequence(seed = 44): MatchState {
  let state = createPilotMatch(seed);
  const random = new SeededRandom(seed);
  state = resolveAction(state, { type: 'pass', actorId: 'yanis', targetId: 'aaron' }, random).state;
  state = resolveAction(state, { type: 'duel', actorId: 'aaron', targetId: 'mael' }, random).state;
  return resolveAction(state, { type: 'shoot', actorId: 'aaron' }, random).state;
}
