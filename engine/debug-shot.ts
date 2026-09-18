import { createPilotMatch } from './dist/match.js';
import { resolveAction } from './dist/engine.js';
import { SeededRandom } from './dist/random.js';

const base = createPilotMatch(44);
let goals = 0;
const total = 300;
for (let i = 0; i < total; i += 1) {
  const s = structuredClone(base);
  s.timeSeconds = i % 60;
  s.players.aaron!.position = { x: 31, y: 10 };
  s.ball.holderId = 'aaron';
  s.ball.position = { x: 31, y: 10 };
  s.players.teddy!.position = { x: 37, y: 10 };
  const zone = i % 2 === 0 ? { shotSide: 'far' as const, shotHeight: 'low' as const } : { shotSide: 'near' as const, shotHeight: 'high' as const };
  const r = resolveAction(s, { type: 'shoot', actorId: 'aaron', shotType: 'jump', ...zone }, new SeededRandom(7000 + i * 37));
  if (r.event.result === 'goal') goals += 1;
}
console.log('GOALS', goals, '/', total, '=', ((goals / total) * 100).toFixed(1) + '%');

