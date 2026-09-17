import type { DefensiveSystem, MatchState, PlayerRole, PlayerState, TeamId, Vector2 } from './types.js';

interface PlayerSeed {
  id: string;
  name: string;
  team: TeamId;
  role: PlayerRole;
  position: Vector2;
  passing: number;
  reception: number;
  duel: number;
  defense: number;
  anticipation: number;
  shooting: number;
  goalkeeper: number;
  acceleration: number;
}

const players: PlayerSeed[] = [
  { id: 'pierre', name: 'Pierre', team: 'nangis', role: 'wing', position: { x: 4, y: 4 }, passing: 72, reception: 78, duel: 74, defense: 70, anticipation: 68, shooting: 80, goalkeeper: 0, acceleration: 78 },
  { id: 'erwan', name: 'Erwan', team: 'nangis', role: 'back', position: { x: 12, y: 7 }, passing: 76, reception: 76, duel: 86, defense: 75, anticipation: 70, shooting: 88, goalkeeper: 0, acceleration: 84 },
  { id: 'yanis', name: 'Yanis', team: 'nangis', role: 'center', position: { x: 20, y: 10 }, passing: 94, reception: 90, duel: 70, defense: 82, anticipation: 93, shooting: 76, goalkeeper: 0, acceleration: 80 },
  { id: 'aaron', name: 'Aaron', team: 'nangis', role: 'back', position: { x: 28, y: 7 }, passing: 84, reception: 84, duel: 94, defense: 91, anticipation: 84, shooting: 92, goalkeeper: 0, acceleration: 87 },
  { id: 'elian', name: 'Elian', team: 'nangis', role: 'wing', position: { x: 36, y: 4 }, passing: 75, reception: 84, duel: 78, defense: 83, anticipation: 79, shooting: 86, goalkeeper: 0, acceleration: 89 },
  { id: 'edgar', name: 'Edgar', team: 'nangis', role: 'pivot', position: { x: 27, y: 10 }, passing: 78, reception: 82, duel: 88, defense: 90, anticipation: 82, shooting: 84, goalkeeper: 0, acceleration: 61 },
  { id: 'liam', name: 'Liam', team: 'nangis', role: 'goalkeeper', position: { x: 2, y: 10 }, passing: 70, reception: 75, duel: 40, defense: 80, anticipation: 86, shooting: 0, goalkeeper: 88, acceleration: 55 },
  { id: 'malone', name: 'Malone', team: 'lagny', role: 'wing', position: { x: 36, y: 16 }, passing: 78, reception: 86, duel: 88, defense: 68, anticipation: 76, shooting: 96, goalkeeper: 0, acceleration: 91 },
  { id: 'mael', name: 'Mael', team: 'lagny', role: 'back', position: { x: 28, y: 13 }, passing: 75, reception: 78, duel: 89, defense: 84, anticipation: 86, shooting: 90, goalkeeper: 0, acceleration: 90 },
  { id: 'kael', name: 'Kael', team: 'lagny', role: 'center', position: { x: 20, y: 10 }, passing: 92, reception: 88, duel: 82, defense: 92, anticipation: 94, shooting: 84, goalkeeper: 0, acceleration: 82 },
  { id: 'elio', name: 'Elio', team: 'lagny', role: 'back', position: { x: 12, y: 13 }, passing: 86, reception: 82, duel: 76, defense: 78, anticipation: 86, shooting: 80, goalkeeper: 0, acceleration: 76 },
  { id: 'neo', name: 'Neo', team: 'lagny', role: 'wing', position: { x: 4, y: 16 }, passing: 70, reception: 80, duel: 82, defense: 70, anticipation: 77, shooting: 84, goalkeeper: 0, acceleration: 92 },
  { id: 'karim', name: 'Karim', team: 'lagny', role: 'pivot', position: { x: 13, y: 10 }, passing: 72, reception: 80, duel: 83, defense: 86, anticipation: 78, shooting: 79, goalkeeper: 0, acceleration: 60 },
  { id: 'teddy', name: 'Teddy', team: 'lagny', role: 'goalkeeper', position: { x: 38, y: 10 }, passing: 88, reception: 80, duel: 40, defense: 78, anticipation: 90, shooting: 0, goalkeeper: 91, acceleration: 56 }
];

players.push(
  { id: 'leo', name: 'Leo', team: 'nangis', role: 'center', position: { x: 20, y: 8 }, passing: 72, reception: 78, duel: 88, defense: 76, anticipation: 70, shooting: 80, goalkeeper: 0, acceleration: 86 },
  { id: 'ilyes', name: 'Ilyes', team: 'nangis', role: 'back', position: { x: 26, y: 8 }, passing: 74, reception: 78, duel: 80, defense: 73, anticipation: 72, shooting: 86, goalkeeper: 0, acceleration: 88 },
  { id: 'layo', name: 'Layo', team: 'lagny', role: 'back', position: { x: 14, y: 12 }, passing: 68, reception: 76, duel: 78, defense: 94, anticipation: 91, shooting: 66, goalkeeper: 0, acceleration: 68 },
  { id: 'rio', name: 'Rio', team: 'lagny', role: 'back', position: { x: 22, y: 12 }, passing: 84, reception: 82, duel: 80, defense: 68, anticipation: 88, shooting: 78, goalkeeper: 0, acceleration: 84 }
);

function createPlayer(seed: PlayerSeed): PlayerState {
  return { ...seed, energy: 100, pressure: 0, confidence: 70, isOnCourt: ['pierre', 'erwan', 'yanis', 'aaron', 'elian', 'edgar', 'liam', 'malone', 'mael', 'kael', 'elio', 'neo', 'karim', 'teddy'].includes(seed.id) };
}

export function createPilotMatch(seed = 44): MatchState {
  const playerMap = Object.fromEntries(players.map((player) => [player.id, createPlayer(player)]));
  const initialHolder = playerMap.yanis;
  if (!initialHolder) {
    throw new Error('Pilot roster must contain Yanis');
  }
  return {
    seed,
    timeSeconds: 0,
    period: 1,
    ball: { holderId: initialHolder.id, position: { ...initialHolder.position } },
    players: playerMap,
    teams: {
      nangis: { id: 'nangis', score: 0, system: '6-0' as DefensiveSystem, possession: true, timeouts: 3, sevenPlayer: false },
      lagny: { id: 'lagny', score: 0, system: '6-0' as DefensiveSystem, possession: false, timeouts: 3, sevenPlayer: false }
    },
    events: [],
    memory: {
      recentEvents: [],
      patterns: {},
      hypotheses: {}
    }
  };
}
