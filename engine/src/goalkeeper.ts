import type { MatchState, TeamId } from './types.js';

export type ShotType = 'placed' | 'power' | 'lob' | 'roucoulette' | 'chabala' | 'jump' | 'standing' | 'extension';
export type GoalkeeperRead = 'wait' | 'anticipate-low-near' | 'anticipate-low-far' | 'anticipate-high-near' | 'anticipate-high-far' | 'close-angle' | 'advance';

export interface ShotAttempt {
  type: ShotType;
  side: 'near' | 'far' | 'center';
  height: 'high' | 'low' | 'middle';
  power: number;
}

export interface GoalkeeperDecision {
  read: GoalkeeperRead;
  confidence: number;
  reason: string;
}

function opponentOf(team: TeamId): TeamId {
  return team === 'nangis' ? 'lagny' : 'nangis';
}

export function chooseGoalkeeperRead(state: MatchState, goalkeeperTeam: TeamId, shooterId: string, shot: ShotAttempt, shooterContext?: { aloneAfterBeaten?: boolean }): GoalkeeperDecision {
  const goalkeeper = Object.values(state.players).find((player) => player.team === goalkeeperTeam && player.role === 'goalkeeper' && player.isOnCourt);
  const shooter = state.players[shooterId];
  if (!goalkeeper || !shooter) {
    return { read: 'wait', confidence: 0.2, reason: 'insufficient information' };
  }
  // P2 — duel de lecture (docs 03, 14 S47-48) : le gardien lit une ZONE
  // (cote + hauteur), pas le geste abstrait. Sa memoire porte sur les zones
  // visees par ce tireur : repetitions -> anticipation ciblee.
  const zoneKey = `shoot-zone:${shot.side}:${shot.height}`;
  const repetitions = state.memory.patterns[zoneKey]?.occurrences ?? 0;
  const gestureKey = `shoot:${shot.type}:${shot.side}`;
  const gestureReps = state.memory.patterns[gestureKey]?.occurrences ?? 0;
  const confidence = Math.min(0.9, 0.35 + repetitions * 0.12 + gestureReps * 0.05 + goalkeeper.anticipation / 300);
  // Seul face au gardien apres duel gagne : difficile d'anticiper, le gardien
  // attend le geste (doc 13 S48-13 : Teddy lit la deuxieme feinte, pas la premiere).
  const shooterAlone = shooterContext?.aloneAfterBeaten === true;
  if (shot.type === 'lob') return { read: 'advance', confidence, reason: 'close the lob angle' };
  if (!shooterAlone && repetitions >= 2) {
    const read = `anticipate-${shot.height}-${shot.side}` as GoalkeeperRead;
    return { read, confidence, reason: `repeated ${shot.side} ${shot.height} zone` };
  }
  // Tir a bout portant de pivot : fermer l'angle plutot qu'anticiper.
  if (shot.power >= 6 && (shot.side === 'center' || shot.height === 'middle')) {
    return { read: 'close-angle', confidence: confidence - 0.05, reason: 'cut the close-range angle' };
  }
  if (shot.height === 'low' && !shooterAlone) {
    const read = (shot.side === 'far' ? 'anticipate-low-far' : 'anticipate-low-near') as GoalkeeperRead;
    return { read, confidence: confidence - 0.08, reason: 'protect the lower target' };
  }
  return { read: 'wait', confidence, reason: 'preserve reaction time' };
}

export function goalkeeperAdvantage(state: MatchState, goalkeeperTeam: TeamId, shooterId: string, shot: ShotAttempt, shooterContext?: { aloneAfterBeaten?: boolean }): number {
  const decision = chooseGoalkeeperRead(state, goalkeeperTeam, shooterId, shot, shooterContext);
  const goalkeeper = Object.values(state.players).find((player) => player.team === goalkeeperTeam && player.role === 'goalkeeper' && player.isOnCourt);
  if (!goalkeeper) return 0;
  // D-018 : le gardien pese sans murer le but. Placement 0.15, lecture 0.30
  // quand il anticipe la zone, et le contre-pied coute -14. Les buts doivent
  // tomber : Liam et Teddy restent forts, plus infranchissables.
  const readBonus = decision.read === 'wait' ? goalkeeper.goalkeeper * 0.15 : goalkeeper.anticipation * decision.confidence * 0.3;
  // P2 — lecture juste = bonus marque, lecture fausse = le gardien est pris :
  // anticiper une zone et voir le ballon partir ailleurs coute cher.
  const shotZone = `anticipate-${shot.height}-${shot.side}`;
  const readRight = decision.read === shotZone;
  const readWrong = decision.read.startsWith('anticipate-') && !readRight;
  const styleBonus =
    shot.type === 'roucoulette' && decision.read === 'anticipate-high-far' ? 12 :
    shot.type === 'lob' && decision.read === 'advance' ? 16 :
    readRight ? 10 : 0;
  const wrongPenalty = readWrong ? -14 : 0;
  return readBonus + styleBonus + wrongPenalty;
}

export function mentalSwing(state: MatchState, actorId: string, positive: boolean): MatchState {
  const nextState = structuredClone(state);
  const actor = nextState.players[actorId];
  if (!actor) return nextState;
  actor.confidence = Math.max(0, Math.min(100, actor.confidence + (positive ? 5 : -5)));
  actor.pressure = Math.max(0, Math.min(100, actor.pressure + (positive ? -4 : 6)));
  return nextState;
}

export function goalkeeperOpponent(_state: MatchState, shooterTeam: TeamId): TeamId {
  return opponentOf(shooterTeam);
}
