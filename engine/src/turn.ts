import { SeededRandom } from './random.js';
import { distanceToGoal } from './court.js';
import { chooseDefenseOrder, defenseOrderToContest, defenseOrderAdvantage, getSituation } from './engine.js';
import { playAction } from './possession.js';
import type { ActionIntent, DuelDecision, MatchEvent, MatchState, PlayerState, TeamId } from './types.js';
import type { RestartKind } from './possession.js';

// Systeme de tour (D-018, retour de test doc 18) : la possession se joue en
// manches de decisions opposees, comme au hand un porteur et son vis-a-vis
// tranchent en meme temps. Trois regles, et rien d'autre :
//
// 1. La manche commence quand l'attaque arrive a 12 m du but defendu. Avant,
//    c'est l'approche : la defense tient sa ligne A PLAT (sauf systeme qui
//    decide le contraire), l'attaque monte. Aucune fenetre, aucun bruit.
// 2. Les deux camps decident SANS voir le choix adverse (aveugle simultane,
//    doc 05 §103). On ne reagit pas : on lit la situation et on verrouille.
// 3. L'initiative, c'est la vitesse (acceleration + anticipation), pas la
//    reaction. Qui gagne l'initiative joue son geste en premier, et son choix
//    porte plus fort. C'est Inazuma, pas du temps reel.
export const TURN_ENTRY_DISTANCE = 12;

// La manche est ouverte des que le porteur entre dans les 12 m du but
// attaque. Pour Nangis (but a x=40), cela veut dire x >= 28. Pour Lagny
// (but a x=0), x <= 12. La defense reste a plat tant que ce n'est pas le cas.
export function inTurnRange(state: MatchState, team: TeamId): boolean {
  const holder = state.players[state.ball.holderId];
  if (!holder || holder.team !== team) return false;
  return distanceToGoal(holder.position, team) <= TURN_ENTRY_DISTANCE;
}

export interface Initiative {
  side: 'attack' | 'defense';
  attackerValue: number;
  defenderValue: number;
  reason: string;
}

// Vitesse effective = acceleration (le premier pas) + anticipation (lire avant
// les autres). L'elan du porteur compte : un attaquant lance part devant.
export function speedValue(player: PlayerState, momentum = 0): number {
  return player.acceleration * 1.5 + player.anticipation * 0.3 + momentum * 0.06;
}

export function resolveInitiative(attacker: PlayerState, defender: PlayerState, random: SeededRandom): Initiative {
  const attackerValue = speedValue(attacker, attacker.momentum ?? 0);
  // Le defenseur a l'avantage du face-a-face : il voit le porteur, pas
  // l'inverse. Il joue avec un petit bonus de placement, jamais de triche.
  const defenderValue = speedValue(defender) + 6;
  if (Math.abs(attackerValue - defenderValue) < 0.001) {
    // Egalite parfaite : le sort tranche, comme un entre-deux.
    const side = random.chance(0.5) ? 'attack' : 'defense';
    return { side, attackerValue, defenderValue, reason: 'égalité de vitesse : entre-deux' };
  }
  return attackerValue > defenderValue
    ? { side: 'attack', attackerValue, defenderValue, reason: 'premier pas du porteur' }
    : { side: 'defense', attackerValue, defenderValue, reason: 'lecture anticipée du défenseur' };
}

// L'initiative pese sur l'ordre defensif : celui qui joue en premier impose
// son tempo. Ce n'est pas un jet cache, c'est une histoire lisible.
export function initiativeScale(initiative: Pick<Initiative, 'side'>): number {
  return initiative.side === 'defense' ? 1.35 : 0.7;
}

export interface DefenseTurnChoice {
  order: DuelDecision;
  defenderId: string;
  helperId?: string;
  label: string;
  detail: string;
}

// Registre complet des ordres defensifs du tour : c'est ce que le coach voit
// quand il defend, et ce que l'IA tire au sort aveugle. Six ordres, pas
// quarante : tenir, ceinturer, intercepter, aider, faire faute, replier.
export const DEFENSE_TURN_ORDERS: Array<{ order: DuelDecision; label: string; detail: string }> = [
  { order: 'hold', label: 'Tenir son vis-à-vis', detail: 'Rester collé, ne pas s’engager : l’action est contenue' },
  { order: 'contain', label: 'Ceinturer', detail: 'Cadrer le porteur, fermer l’intervalle — faute possible' },
  { order: 'intercept', label: 'Tenter l’interception', detail: 'Lire la passe et la couper : vol, ou défenseur effacé' },
  { order: 'help', label: 'Appeler un renfort', detail: 'Doubler le porteur, mais ouvrir un intervalle ailleurs' },
  { order: 'foul', label: 'Faire faute', detail: 'Stopper l’action au prix d’un coup franc' },
  { order: 'retreat', label: 'Replier le bloc', detail: 'Protéger l’intervalle, concéder le tir lointain' }
];

// Ordre de l'IA : jamais au hasard pur. Elle lit le porteur, la distance,
// l'espace et ta memoire d'habitudes — sans voir ton choix (aveugle simultane).
export function chooseTurnDefenseOrder(state: MatchState, defendingTeam: TeamId, random: SeededRandom): DefenseTurnChoice {
  const holder = state.players[state.ball.holderId];
  const blind = chooseDefenseOrder(state, defendingTeam, random);
  const defender = state.players[blind.defenderId];
  if (holder && defender) {
    // Memoire des zones de tir : si tu arroses la meme zone, elle sort dessus.
    const zoneHabit =
      (state.memory.patterns['shoot-zone:far:low']?.occurrences ?? 0) +
      (state.memory.patterns['shoot-zone:near:low']?.occurrences ?? 0);
    const shot = state.memory.patterns['shoot:goal']?.occurrences ?? 0;
    const dist = Math.hypot(defender.position.x - holder.position.x, defender.position.y - holder.position.y);
    if (dist <= 2.5 && shot >= 2 && zoneHabit >= 2 && random.chance(0.4)) {
      return { order: 'foul', defenderId: defender.id, label: 'Faire faute', detail: 'Tu marques trop de près : elle coupe l’action' };
    }
  }
  const meta = DEFENSE_TURN_ORDERS.find((entry) => entry.order === blind.decision) ?? DEFENSE_TURN_ORDERS[0]!;
  const choice: DefenseTurnChoice = {
    order: meta.order,
    defenderId: blind.defenderId,
    label: meta.label,
    detail: meta.detail
  };
  if (blind.helperId) choice.helperId = blind.helperId;
  return choice;
}

// Les ordres que TU peux donner pendant ta manche defensive : tout le registre,
// attaches au defenseur de reference du porteur. Le choix reste aveugle :
// l'adversaire a deja verrouille le sien, tu ne le vois qu'a la resolution.
export function defenseTurnOptions(state: MatchState, defendingTeam: TeamId, random: SeededRandom): DefenseTurnChoice[] {
  const blind = chooseDefenseOrder(state, defendingTeam, random);
  const defender = state.players[blind.defenderId];
  // Un renfort n'a de sens que si un autre defenseur peut reellement doubler.
  const helperId = blind.helperId ?? Object.values(state.players).find(
    (player) => player.team === defendingTeam && player.isOnCourt && player.role !== 'goalkeeper' && player.id !== blind.defenderId
  )?.id;
  return DEFENSE_TURN_ORDERS.map((meta) => {
    const choice: DefenseTurnChoice = {
      order: meta.order,
      defenderId: defender?.id ?? blind.defenderId,
      label: meta.label,
      detail: meta.detail
    };
    if (meta.order === 'help' && helperId) choice.helperId = helperId;
    return choice;
  });
}

// Attaque de l'IA pour ta manche defensive : le moteur propose, l'IA choisit,
// jamais recode ici. C'est le pendant de chooseTurnDefenseOrder.
export function aiTurnAttack(state: MatchState, attackingTeam: TeamId, random: SeededRandom, actionCount = 2): ActionIntent | undefined {
  const situation = getSituation(state);
  const holder = state.players[state.ball.holderId];
  if (!holder || holder.team !== attackingTeam) return undefined;
  const candidates = situation.availableActions.filter((intent) => intent.actorId === holder.id);
  if (candidates.length === 0) return undefined;
  const shoot = candidates.find((intent) => intent.type === 'shoot');
  const duel = candidates.find((intent) => intent.type === 'duel');
  const passes = candidates.filter((intent) => intent.type === 'pass');
  if (shoot && (actionCount >= 2 || holder.energy < 35)) return shoot;
  if (duel && random.chance(0.55)) return duel;
  if (passes.length > 0) return passes[Math.floor(random.next() * passes.length)];
  return duel ?? shoot ?? candidates[0];
}

export interface TurnResolution {
  state: MatchState;
  event: MatchEvent;
  initiative: Initiative;
  defense: DefenseTurnChoice;
  possessionChanged: boolean;
  restart?: RestartKind;
}

// Une manche complete : ton geste + l'ordre adverse, resolus ensemble.
// L'initiative ne change pas qui est le meilleur : elle change qui impose son
// tempo. Le defenseur qui lit avant toi pese 1.35 fois plus ; battu au premier
// pas, il pese 0.7.
export function resolveTurn(
  state: MatchState,
  attack: ActionIntent,
  defense: DefenseTurnChoice,
  random: SeededRandom
): TurnResolution {
  const attacker = state.players[attack.actorId];
  const defender = state.players[defense.defenderId];
  const initiative: Initiative = attacker && defender
    ? resolveInitiative(attacker, defender, random)
    : { side: 'attack', attackerValue: 0, defenderValue: 0, reason: 'adversaire introuvable' };

  const contested: ActionIntent = {
    ...attack,
    defenseDecision: defense.order,
    contestedBy: defense.defenderId,
    contestAction: defenseOrderToContest(defense.order),
    orderScale: initiativeScale(initiative)
  };
  if (defense.helperId) contested.helperId = defense.helperId;

  const played = playAction(state, contested, random);
  // Trace de la manche : qui a impose son tempo et quel ordre tenait l'autre
  // camp. Le rapport raconte la manche en mots de banc (doc 11).
  played.event.causes = [
    ...played.event.causes,
    initiative.side === 'attack' ? 'initiative du porteur' : 'initiative du défenseur',
    `ordre adverse : ${defense.label}`
  ];
  const resolution: TurnResolution = {
    state: played.state,
    event: played.event,
    initiative,
    defense,
    possessionChanged: played.possessionChanged
  };
  if (played.restart) resolution.restart = played.restart;
  return resolution;
}

// Avantage de l'ordre tel qu'il sera vecu : l'interface ne recalcule rien, elle
// demande au moteur. Meme formule que resolveTurn, appliquee a un ordre teste.
export function forecastDefenseAdvantage(attackType: string, order: DuelDecision, initiativeSide: 'attack' | 'defense'): number {
  return defenseOrderAdvantage(attackType, {
    type: 'duel',
    actorId: '',
    defenseDecision: order,
    orderScale: initiativeScale({ side: initiativeSide })
  });
}
