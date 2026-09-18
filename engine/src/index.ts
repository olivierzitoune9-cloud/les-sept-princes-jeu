export { createPilotMatch } from './match.js';
export { chooseNextAction } from './ai.js';
export { nearestDefender, observeIntervals, passLaneContest, tacticalZone } from './spatial.js';
export type { IntervalObservation, LaneContest, TacticalZone } from './spatial.js';
export { executeSequence } from './sequence.js';
export {
  COURT_LENGTH,
  COURT_WIDTH,
  GOAL_AREA_RADIUS,
  GOAL_DEPTH,
  GOAL_WIDTH,
  GOALKEEPER_LINE_DISTANCE,
  FREE_THROW_RADIUS,
  PENALTY_DISTANCE,
  CENTRE,
  SUBSTITUTION_ZONE_HALF_LENGTH,
  attackedGoalX,
  attackingDirection,
  centreLine,
  defendedGoalX,
  distanceToGoal,
  freeThrowLine,
  goalAreaLine,
  goalFrame,
  goalPostLateral,
  goalkeeperLine,
  insideCourt,
  penaltyLine,
  substitutionZone
} from './court.js';
export { GOALKEEPER_DEPTH, defensiveBlock, driftTeam, goalkeeperTarget, placeTeam, pressingDefenderId, shapeTargets } from './formation.js';
export type { DriftOptions, TeamShape } from './formation.js';
export { installPossession, playAction, stepShapes } from './possession.js';
export type { PlayedAction, RestartKind, ShapeStep } from './possession.js';
// Systeme de tour (D-018) : manches de decisions opposees a partir de 12 m.
// Remplace comme boucle principale par la vollee planifiee (D-019).
export {
  DEFAULT_HALF_SECONDS,
  HALF_COUNT,
  MAX_CONDITIONALS,
  MAX_MAJOR_ORDERS,
  MAX_MINOR_ORDERS,
  MINOR_INTENTS,
  chooseVolleyDefense,
  matchLengthSeconds,
  resolveVolley,
  validateVolleyPlan
} from './volley.js';
export type {
  AttackVolleyIntent,
  DefenseOrder,
  DefensePlan,
  DefenseVolleyIntent,
  VolleyConditional,
  VolleyOrder,
  VolleyPlan,
  VolleyResult,
  VolleyTrigger
} from './volley.js';
export { locomotionSpeed, observeDynamicGaps } from './spatial.js';
export type { GapObservation } from './spatial.js';
export {
  DEFENSE_TURN_ORDERS,
  TURN_ENTRY_DISTANCE,
  aiTurnAttack,
  chooseTurnDefenseOrder,
  defenseTurnOptions,
  forecastDefenseAdvantage,
  inTurnRange,
  initiativeScale,
  resolveInitiative,
  resolveTurn,
  speedValue
} from './turn.js';
export type { DefenseTurnChoice, Initiative, TurnResolution } from './turn.js';
export { adaptDefense, defensivePressure, recommendedDefense } from './defense.js';
export { chooseGoalkeeperRead, goalkeeperAdvantage, mentalSwing } from './goalkeeper.js';
export { runSeedCampaign } from './validation.js';
export { SHOOTING_RANGE, getSituation, pivotContactBonus, resolveAction, simulatePilotSequence } from './engine.js';
export { callTimeout, changeSystem, setSevenPlayer, substitute } from './coaching.js';
export { createMatchReport, simulateMatch, simulatePossession } from './simulation.js';
export { SeededRandom } from './random.js';
export type * from './types.js';
