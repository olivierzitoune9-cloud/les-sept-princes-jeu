import type { IntervalObservation } from './spatial.js';

export type TeamId = 'nangis' | 'lagny';
export type PlayerRole = 'goalkeeper' | 'wing' | 'back' | 'center' | 'pivot';
export type DefensiveSystem = '6-0' | '1-5' | '1-2-3' | 'hybrid-1-2-3';
export type ActionType = 'pass' | 'duel' | 'shoot' | 'move' | 'run' | 'fix' | 'block' | 'cross' | 'mark' | 'help';
export type ActionTiming = 'immediate' | 'after-pass' | 'after-fixation' | 'after-block' | 'after-movement' | 'after-side-change';
export type ActionIntention = 'secure' | 'hidden' | 'attract' | 'create-space' | 'attack-inside' | 'attack-outside' | 'protect' | 'accelerate' | 'temporize' | 'anticipate';

export interface Vector2 {
  x: number;
  y: number;
}

export interface PlayerState {
  id: string;
  name: string;
  team: TeamId;
  role: PlayerRole;
  position: Vector2;
  energy: number;
  momentum?: number;
  pressure: number;
  confidence: number;
  passing: number;
  reception: number;
  duel: number;
  defense: number;
  anticipation: number;
  shooting: number;
  goalkeeper: number;
  acceleration: number;
  isOnCourt: boolean;
}

export interface TeamState {
  id: TeamId;
  score: number;
  system: DefensiveSystem;
  possession: boolean;
  timeouts: number;
  sevenPlayer: boolean;
  // Marquages stricts persistants : id du defenseur vers id de l adversaire.
  assignments?: Record<string, string>;
}

export interface BallState {
  holderId: string;
  position: Vector2;
}

export interface MatchEvent {
  id: number;
  timeSeconds: number;
  type: string;
  actorId?: string;
  targetId?: string;
  result: string;
  causes: string[];
  intention?: ActionIntention;
  timing?: ActionTiming;
}

export interface PatternObservation {
  key: string;
  occurrences: number;
  confidence: number;
  lastSeenAt: number;
}

export interface MatchMemory {
  recentEvents: string[];
  patterns: Record<string, PatternObservation>;
  hypotheses: Record<string, number>;
}

export interface MatchState {
  seed: number;
  timeSeconds: number;
  period: 1 | 2;
  ball: BallState;
  players: Record<string, PlayerState>;
  teams: Record<TeamId, TeamState>;
  events: MatchEvent[];
  memory: MatchMemory;
}

export interface ActionIntent {
  type: ActionType;
  actorId: string;
  targetId?: string;
  targetPosition?: Vector2;
  intention?: ActionIntention;
  timing?: ActionTiming;
  shotType?: 'placed' | 'power' | 'lob' | 'roucoulette' | 'chabala';
  shotSide?: 'near' | 'far' | 'center';
  shotHeight?: 'high' | 'low' | 'middle';
  // Qualifie la course du porteur pour l interface (doc 01 §4).
  runKind?: 'advance' | 'diagonal' | 'lateral';
}

export interface Situation {
  state: MatchState;
  availableActions: ActionIntent[];
  openIntervals: string[];
  intervals: IntervalObservation[];
  threats: string[];
}

export interface ActionResolution {
  state: MatchState;
  event: MatchEvent;
}
