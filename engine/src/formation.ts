import { COURT_WIDTH, attackedGoalX, attackingDirection, defendedGoalX } from './court.js';
import type { DefensiveSystem, MatchState, PlayerRole, PlayerState, TeamId, Vector2 } from './types.js';

// Dispositifs et placement.
// Un emplacement est decrit par une profondeur en metres et une position laterale.
// La profondeur est mesuree depuis un but de reference : le sien pour un dispositif
// defensif ou une transition, celui de l adversaire pour une attaque installee.
export type TeamShape = 'attack' | 'transition' | DefensiveSystem;

interface ShapeSlot {
  id: string;
  roles: PlayerRole[];
  depth: number;
  lateral: number;
  from: 'own-goal' | 'opponent-goal';
}

function slot(id: string, roles: PlayerRole[], depth: number, lateral: number, from: ShapeSlot['from'] = 'own-goal'): ShapeSlot {
  return { id, roles, depth, lateral, from };
}

// Le 6-0 : six defenseurs devant le but, deux ailiers pres des poteaux,
// deux arrieres, deux demi-centres qui ferment l axe.
const SIX_ZERO: ShapeSlot[] = [
  slot('wing-left', ['wing'], 6.5, 2.5),
  slot('wing-right', ['wing'], 6.5, 17.5),
  slot('back-left', ['back'], 8, 5.5),
  slot('back-right', ['back'], 8, 14.5),
  slot('half-left', ['center', 'back'], 8.5, 8.5),
  slot('half-right', ['pivot', 'back'], 8.5, 11.5)
];

// Le 1-5 : un defenseur avance pour presser le demi-centre, cinq sur la ligne.
// C est le dispositif que le moteur choisit quand Yanis attaque trop souvent.
const ONE_FIVE: ShapeSlot[] = [
  slot('wing-left', ['wing'], 6.5, 2.5),
  slot('wing-right', ['wing'], 6.5, 17.5),
  slot('back-left', ['back'], 7.5, 6.5),
  slot('back-right', ['back'], 7.5, 13.5),
  slot('advanced', ['center', 'back'], 12, 10),
  slot('line-centre', ['pivot'], 7.5, 10)
];

// Le 1-2-3 : trois sur la ligne, deux au 9 m, un avance.
const ONE_TWO_THREE: ShapeSlot[] = [
  slot('wing-left', ['wing'], 6.5, 3),
  slot('wing-right', ['wing'], 6.5, 17),
  slot('line-centre', ['pivot'], 6.5, 10),
  slot('half-left', ['back'], 9.5, 7),
  slot('half-right', ['back'], 9.5, 13),
  slot('advanced', ['center'], 12.5, 10)
];

// Variante hybride, meme structure etagee plus haut.
const HYBRID_ONE_TWO_THREE: ShapeSlot[] = [
  slot('wing-left', ['wing'], 7, 3),
  slot('wing-right', ['wing'], 7, 17),
  slot('line-centre', ['pivot'], 7, 10),
  slot('half-left', ['back'], 9.5, 7),
  slot('half-right', ['back'], 9.5, 13),
  slot('advanced', ['center'], 11.5, 10)
];

// Attaque installee autour du 9 m adverse : ailes hauts et larges pour
// etirer, arrieres a 9 m, pivot appuye sur la ligne des 6 m (doc 17, E-003).
const ATTACK: ShapeSlot[] = [
  slot('left-wing', ['wing'], 6, 1.5, 'opponent-goal'),
  slot('right-wing', ['wing'], 6, 18.5, 'opponent-goal'),
  slot('left-back', ['back'], 10.5, 5, 'opponent-goal'),
  slot('right-back', ['back'], 10.5, 15, 'opponent-goal'),
  slot('centre', ['center'], 12.5, 10, 'opponent-goal'),
  slot('pivot', ['pivot'], 6.8, 10, 'opponent-goal')
];

// Transition : juste apres une recuperation ou une remise en jeu, l equipe est
// deja etalee autour de la ligne mediane, puis se rapproche de sa forme d attaque.
const TRANSITION: ShapeSlot[] = [
  slot('left-wing', ['wing'], 21, 2.5, 'opponent-goal'),
  slot('right-wing', ['wing'], 21, 17.5, 'opponent-goal'),
  slot('left-back', ['back'], 22, 6.5, 'opponent-goal'),
  slot('right-back', ['back'], 22, 13.5, 'opponent-goal'),
  slot('centre', ['center'], 24, 10, 'opponent-goal'),
  // Le pivot part deja proche de sa zone : il ne doit pas traverser le
  // terrain pendant l'installation (retour de test doc 18 §1.4).
  slot('pivot', ['pivot'], 9.5, 10, 'opponent-goal')
];

const SHAPES: Record<TeamShape, ShapeSlot[]> = {
  attack: ATTACK,
  transition: TRANSITION,
  '6-0': SIX_ZERO,
  '1-5': ONE_FIVE,
  '1-2-3': ONE_TWO_THREE,
  'hybrid-1-2-3': HYBRID_ONE_TWO_THREE
};

export const GOALKEEPER_DEPTH = 1.4;

function distance(first: Vector2, second: Vector2): number {
  return Math.hypot(first.x - second.x, first.y - second.y);
}

function slotTarget(team: TeamId, shapeSlot: ShapeSlot): Vector2 {
  const referenceX = shapeSlot.from === 'own-goal' ? defendedGoalX(team) : attackedGoalX(team);
  const sign = shapeSlot.from === 'own-goal' ? attackingDirection(team) : -attackingDirection(team);
  return { x: referenceX + sign * shapeSlot.depth, y: shapeSlot.lateral };
}

function onCourtPlayers(state: MatchState, team: TeamId, includeGoalkeeper = false): PlayerState[] {
  return Object.values(state.players).filter(
    (player) => player.team === team && player.isOnCourt && (includeGoalkeeper || player.role !== 'goalkeeper')
  );
}

function goalkeeperId(state: MatchState, team: TeamId): string | undefined {
  return Object.values(state.players).find(
    (player) => player.team === team && player.role === 'goalkeeper' && player.isOnCourt
  )?.id;
}

// Affectation emplacement vers joueur : d abord l affinite de poste, puis la
// proximite avec la position actuelle. Deterministe, et stable lors d un
// remplacement puisque le tri conserve l ordre de l effectif en cas d egalite.
function assignSlots(state: MatchState, team: TeamId, shapeSlots: ShapeSlot[]): Record<string, string> {
  const remaining = onCourtPlayers(state, team);
  const assignment: Record<string, string> = {};
  for (const shapeSlot of shapeSlots) {
    const target = slotTarget(team, shapeSlot);
    const ordered = [...remaining].sort((first, second) => {
      const affinityFirst = shapeSlot.roles.includes(first.role) ? 0 : 1;
      const affinitySecond = shapeSlot.roles.includes(second.role) ? 0 : 1;
      if (affinityFirst !== affinitySecond) return affinityFirst - affinitySecond;
      return distance(first.position, target) - distance(second.position, target);
    });
    const chosen = ordered[0];
    if (!chosen) break;
    assignment[shapeSlot.id] = chosen.id;
    remaining.splice(remaining.indexOf(chosen), 1);
  }
  return assignment;
}

export function goalkeeperTarget(state: MatchState, team: TeamId, holdLine = false): Vector2 {
  const x = defendedGoalX(team) + attackingDirection(team) * GOALKEEPER_DEPTH;
  const lateral = holdLine ? 10 : Math.max(8, Math.min(12, state.ball.position.y));
  return { x, y: lateral };
}

// Position cible de chaque joueur de l equipe pour une forme donnee, gardien compris.
// Sert au placement instantane comme au replacement progressif.
export function shapeTargets(state: MatchState, team: TeamId, shape: TeamShape): Record<string, Vector2> {
  const assignment = assignSlots(state, team, SHAPES[shape]);
  const targets: Record<string, Vector2> = {};
  for (const shapeSlot of SHAPES[shape]) {
    const playerId = assignment[shapeSlot.id];
    if (playerId) {
      targets[playerId] = slotTarget(team, shapeSlot);
    }
  }
  const keeper = goalkeeperId(state, team);
  if (keeper) {
    targets[keeper] = goalkeeperTarget(state, team);
  }
  return targets;
}

// Placement instantane : reserve aux remises en jeu, jamais pendant une action.
export function placeTeam(state: MatchState, team: TeamId, shape: TeamShape, keepIds: string[] = []): void {
  const keeper = goalkeeperId(state, team);
  const targets = shapeTargets(state, team, shape);
  const keep = new Set(keepIds);
  for (const [playerId, target] of Object.entries(targets)) {
    if (keep.has(playerId)) continue;
    const player = state.players[playerId];
    if (!player) continue;
    player.position = playerId === keeper ? goalkeeperTarget(state, team, true) : { ...target };
  }
}

export interface DriftOptions {
  maxStep: number;
  keepIds?: string[];
  // Le defenseur le plus proche du porteur sort du bloc pour le presser.
  press?: boolean;
  // Les autres defenseurs coulissent vers le cote du ballon, sans quitter la zone.
  ballSideShift?: number;
}

// Replacement progressif : aucun joueur ne se teleporte (doc 07).
export function driftTeam(state: MatchState, team: TeamId, shape: TeamShape, options: DriftOptions): number {
  const keep = new Set(options.keepIds ?? []);
  const keeper = goalkeeperId(state, team);
  const targets = shapeTargets(state, team, shape);
  const holder = state.players[state.ball.holderId];
  let moved = 0;

  if (options.press && holder) {
    // Le bloc ne sort pas de sa zone : la pression ne commence que quand le
    // ballon entre dans les 16 m du but defendu. Sinon, on tient le bloc.
    // Un battu ne presse jamais : le second rideau doit prendre le relais.
    const holderDistance = distance(holder.position, { x: defendedGoalX(team), y: 10 });
    if (holderDistance <= 16) {
      const pressTarget = holder.position;
      const ordered = onCourtPlayers(state, team)
        .filter((player) => (player.beatenUntil ?? 0) <= state.timeSeconds)
        .sort(
        (first, second) => distance(first.position, pressTarget) - distance(second.position, pressTarget)
      );
      const presser = ordered.length > 0 ? ordered[0] : undefined;
      if (presser) {
        // Le defenseur se place cote but, jamais sur le porteur.
        const slot = targets[presser.id];
        if (slot) {
          targets[presser.id] = { x: pressTarget.x + attackingDirection(team) * 1.4, y: pressTarget.y };
        }
      }
    }
  }

  for (const player of onCourtPlayers(state, team, true)) {
    if (keep.has(player.id)) continue;
    const target = targets[player.id];
    if (!target) continue;
    let finalTarget = target;
    const assignedAttackerId = state.teams[team].assignments?.[player.id];
    const assignedAttacker = assignedAttackerId ? state.players[assignedAttackerId] : undefined;
    if (player.id === keeper) {
      finalTarget = goalkeeperTarget(state, team);
    } else if (assignedAttacker && assignedAttacker.isOnCourt) {
      // Marquage strict persistant : le defenseur colle son adversaire assigne
      // au lieu de rejoindre son emplacement (rapport 14, phase B).
      finalTarget = { x: assignedAttacker.position.x + attackingDirection(team) * 1.4, y: assignedAttacker.position.y };
    } else if (options.ballSideShift && holder && shape !== 'attack') {
      const shift = Math.max(-options.ballSideShift, Math.min(options.ballSideShift, holder.position.y - target.y));
      finalTarget = {
        x: target.x,
        y: Math.max(1.5, Math.min(COURT_WIDTH - 1.5, target.y + shift))
      };
    }
    // Battu : le defenseur ne revient pas dans le dos du porteur. Il decroche
    // vers son but a moitie vitesse, ce qui ouvre l'intervalle (mandat pilote-sim).
    const beaten = (player.beatenUntil ?? 0) > state.timeSeconds;
    const remaining = distance(player.position, beaten ? { x: defendedGoalX(team) + attackingDirection(team) * 7, y: 10 } : finalTarget);
    if (remaining < 0.05) continue;
    const speedFactor = beaten ? 0.5 : 1;
    const step = Math.min(options.maxStep * (0.55 + player.energy / 220) * speedFactor, remaining);
    const destination = beaten ? { x: defendedGoalX(team) + attackingDirection(team) * 7, y: 10 } : finalTarget;
    const ratio = step / remaining;
    player.position = {
      x: player.position.x + (destination.x - player.position.x) * ratio,
      y: player.position.y + (destination.y - player.position.y) * ratio
    };
    player.energy = Math.max(0, player.energy - step * 0.22);
    moved += step;
  }
  return moved;
}

// Trace du bloc defensif, du cote gauche vers le cote droit : c est ce que
// l interface dessine pour rendre le dispositif lisible.
export function defensiveBlock(state: MatchState, team: TeamId): Vector2[] {
  return onCourtPlayers(state, team)
    .map((player) => player.position)
    .sort((first, second) => first.y - second.y);
}

export function pressingDefenderId(state: MatchState, defendingTeam: TeamId): string | undefined {
  const holder = state.players[state.ball.holderId];
  if (!holder) return undefined;
  return onCourtPlayers(state, defendingTeam).sort(
    (first, second) => distance(first.position, holder.position) - distance(second.position, holder.position)
  )[0]?.id;
}

// Installation de l'attaque (doc 18 §3.1) : l'attaque est installee quand tous
// ses joueurs de champ sont a portee de leur emplacement d'attaque (porteur
// excepte). Tant que ce n'est pas le cas, la defense reste sur son systeme.
export function attackInstalled(state: MatchState, team: TeamId, tolerance = 4): boolean {
  const targets = shapeTargets(state, team, 'attack');
  const holderId = state.ball.holderId;
  for (const player of onCourtPlayers(state, team)) {
    if (player.id === holderId) continue;
    const target = targets[player.id];
    if (!target) continue;
    if (distance(player.position, target) > tolerance) return false;
  }
  return true;
}

// Vis-a-vis de reference (doc 18 §3.2, retour de test §1.6) : chaque attaquant
// a un defenseur de reference assigne par couloir et affinite de poste, pas par
// simple proximite. Elio ne doit plus se retrouver face a Aaron cote droit.
// Score : affinite de poste (fort), meme couloir (fort), puis proximite.
const ROLE_AFFINITY: Record<PlayerRole, PlayerRole[]> = {
  goalkeeper: [],
  wing: ['wing'],
  back: ['back'],
  center: ['center', 'back'],
  pivot: ['pivot', 'back']
};

function couloir(y: number): 'left' | 'centre' | 'right' {
  if (y < 6.5) return 'left';
  if (y > 13.5) return 'right';
  return 'centre';
}

export function referenceDefenderId(state: MatchState, attackerId: string): string | undefined {
  const attacker = state.players[attackerId];
  if (!attacker) return undefined;
  const attackingCouloir = couloir(attacker.position.y);
  const affinity = ROLE_AFFINITY[attacker.role];
  const candidates = onCourtPlayers(state, attacker.team === 'nangis' ? 'lagny' : 'nangis');
  let best: { id: string; score: number } | undefined;
  for (const defender of candidates) {
    const roleAffinity = affinity.includes(defender.role) ? 1 : 0;
    const couloirAffinity = couloir(defender.position.y) === attackingCouloir ? 1 : 0;
    const proximity = -distance(defender.position, attacker.position) * 0.15;
    const score = roleAffinity * 4 + couloirAffinity * 3 + proximity;
    if (!best || score > best.score) {
      best = { id: defender.id, score };
    }
  }
  return best?.id;
}
