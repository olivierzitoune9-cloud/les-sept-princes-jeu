import { describe, expect, it } from 'vitest';
import { createPilotMatch } from './match.js';
import {
  DEFAULT_HALF_SECONDS,
  HALF_COUNT,
  MAX_MAJOR_ORDERS,
  chooseVolleyDefense,
  matchLengthSeconds,
  resolveVolley,
  validateVolleyPlan,
  type DefensePlan,
  type VolleyPlan
} from './volley.js';
import { observeDynamicGaps } from './spatial.js';
import { SeededRandom } from './random.js';
import type { MatchState } from './types.js';

// 6-0 de Lagny propre, en face du but attaque par Nangis (x = 40).
function installSixZero(state: MatchState): MatchState {
  const spots: Record<string, { x: number; y: number }> = {
    malone: { x: 34, y: 2 },
    mael: { x: 34.5, y: 6 },
    kael: { x: 35, y: 10 },
    elio: { x: 34.5, y: 14 },
    neo: { x: 34, y: 18 },
    karim: { x: 36.5, y: 10 }
  };
  for (const [id, position] of Object.entries(spots)) {
    const player = state.players[id];
    if (player) player.position = { ...position };
  }
  return state;
}

const HOLD_ALL: DefensePlan = {
  team: 'lagny',
  orders: ['malone', 'mael', 'kael', 'elio', 'neo', 'karim'].map((actorId) => ({ actorId, kind: 'hold' as const }))
};

describe('vollee planifiee (D-019)', () => {
  it('expose une horloge FIFA configurable, sans vitesses', () => {
    expect(HALF_COUNT).toBe(2);
    expect(DEFAULT_HALF_SECONDS).toBe(600);
    expect(matchLengthSeconds()).toBe(1200);
    expect(matchLengthSeconds(1800)).toBe(3600);
  });

  it('calcule des gaps dynamiques entre defenseurs adjacents', () => {
    const state = installSixZero(createPilotMatch(44));
    const gaps = observeDynamicGaps(state, 'nangis');
    expect(gaps.length).toBe(5);
    for (const gap of gaps) {
      expect(gap.width).toBeGreaterThan(0);
      expect(Number.isFinite(gap.window)).toBe(true);
      expect(gap.attackerAccess).toBeGreaterThan(0);
      expect(gap.defenderAccess).toBeGreaterThan(0);
    }
  });

  it('est deterministe : meme etat, memes plans, meme seed = meme volee', () => {
    const state = installSixZero(createPilotMatch(44));
    const attack: VolleyPlan = {
      team: 'nangis',
      orders: [
        { actorId: 'yanis', kind: 'pass', targetId: 'aaron' },
        { actorId: 'aaron', kind: 'attackSpace', targetPosition: { x: 34.75, y: 10 } }
      ]
    };
    const first = resolveVolley(state, attack, chooseVolleyDefense(state, 'nangis'), new SeededRandom(777));
    const second = resolveVolley(state, attack, chooseVolleyDefense(state, 'nangis'), new SeededRandom(777));
    expect(JSON.stringify(first.state)).toBe(JSON.stringify(second.state));
    expect(first.events.map((event) => event.result)).toEqual(second.events.map((event) => event.result));
  });

  it('fait progresser l horloge de match de la duree de la volee', () => {
    const state = installSixZero(createPilotMatch(44));
    const attack: VolleyPlan = {
      team: 'nangis',
      orders: [{ actorId: 'yanis', kind: 'pass', targetId: 'aaron' }]
    };
    const result = resolveVolley(state, attack, HOLD_ALL, new SeededRandom(21));
    expect(result.durationSeconds).toBeGreaterThan(0);
    expect(result.durationSeconds).toBeLessThanOrEqual(5);
    expect(result.state.timeSeconds).toBeCloseTo(state.timeSeconds + result.durationSeconds, 2);
  });

  it('transfere le ballon au receveur quand la ligne de passe est ouverte', () => {
    const state = installSixZero(createPilotMatch(44));
    const attack: VolleyPlan = {
      team: 'nangis',
      orders: [{ actorId: 'yanis', kind: 'pass', targetId: 'aaron' }]
    };
    const result = resolveVolley(state, attack, HOLD_ALL, new SeededRandom(21));
    // Passe courte entre coequipiers eloignes du bloc : ligne libre, reception.
    expect(result.state.ball.holderId).toBe('aaron');
    expect(result.events.some((event) => event.type === 'pass' && event.result === 'completed')).toBe(true);
  });

  it('fait naitre le duel de la geometrie, jamais d un menu', () => {
    const state = installSixZero(createPilotMatch(44));
    // Aaron colle au bloc : son attackSpace croise le contact de Kael.
    state.players.aaron!.position = { x: 33.4, y: 10 };
    const attack: VolleyPlan = {
      team: 'nangis',
      orders: [{ actorId: 'aaron', kind: 'attackSpace', targetPosition: { x: 36.5, y: 10 } }]
    };
    const result = resolveVolley(state, attack, HOLD_ALL, new SeededRandom(9));
    const duel = result.events.find((event) => event.type === 'duel');
    expect(duel).toBeDefined();
    expect(['won', 'contained', 'foul-defense']).toContain(duel!.result);
  });

  it('recompense la consequence de la fixation : le bloc aspire ouvre l espace oppose', () => {
    const base = installSixZero(createPilotMatch(44));
    // Kael monte au contact de Yanis : la fixation devient possible.
    base.players.kael!.position = { x: 22, y: 10 };
    const attack: VolleyPlan = {
      team: 'nangis',
      orders: [{ actorId: 'yanis', kind: 'fix', targetId: 'kael' }]
    };
    const pressPlan: DefensePlan = {
      team: 'lagny',
      orders: HOLD_ALL.orders.map((order) => (order.actorId === 'kael' ? { ...order, kind: 'pressBall' as const } : order))
    };
    const held = resolveVolley(base, attack, HOLD_ALL, new SeededRandom(31));
    const pressed = resolveVolley(base, attack, pressPlan, new SeededRandom(31));
    // La fixation existe et est tracee.
    expect(pressed.events.some((event) => event.type === 'fixation')).toBe(true);
    // Le defenseur qui sort vers le porteur ouvre une largeur superieure a un
    // bloc immobile : la reponse defensive cree le probleme suivant.
    const maxHeld = Math.max(...held.gaps.map((gap) => gap.width));
    const maxPressed = Math.max(...pressed.gaps.map((gap) => gap.width));
    expect(maxPressed).toBeGreaterThan(maxHeld);
  });

  it('laisse la defense fermer la fenetre locale sans suivre betement le ballon', () => {
    const base = installSixZero(createPilotMatch(44));
    base.players.aaron!.position = { x: 30, y: 8 };
    const attack: VolleyPlan = {
      team: 'nangis',
      orders: [{ actorId: 'aaron', kind: 'attackSpace', targetPosition: { x: 35, y: 8 } }]
    };
    const contained: DefensePlan = {
      team: 'lagny',
      orders: ['mael', 'kael'].map((actorId) => ({ actorId, kind: 'contain' as const, maxDisplacement: 3 }))
    };
    const open = resolveVolley(base, attack, HOLD_ALL, new SeededRandom(5));
    const closed = resolveVolley(base, attack, contained, new SeededRandom(5));
    // La fenetre LOCALE se referme : les deux defenseurs d'origine du gap vise
    // se resserent l'un vers l'autre sous doctrine contain. Ailleurs, contenir
    // ouvre un autre intervalle (le dilemme defensif voulu) : on ne compare
    // donc jamais le max global, on mesure la paire visee.
    const pairDistance = (result: ReturnType<typeof resolveVolley>) => {
      const left = result.state.players.mael!.position;
      const right = result.state.players.kael!.position;
      return Math.hypot(left.x - right.x, left.y - right.y);
    };
    expect(pairDistance(closed)).toBeLessThan(pairDistance(open));
  });

  it('termine la volee en arret anticipe quand le tir part', () => {
    const state = installSixZero(createPilotMatch(44));
    const attack: VolleyPlan = {
      team: 'nangis',
      orders: [
        { actorId: 'yanis', kind: 'move', targetPosition: { x: 32, y: 10 } },
        { actorId: 'yanis', kind: 'shoot', startAt: 2.6, shotType: 'jump' }
      ]
    };
    const result = resolveVolley(state, attack, HOLD_ALL, new SeededRandom(13));
    expect(result.endedEarly).toBe(true);
    expect(['shot', 'goal', 'save']).toContain(result.endReason);
    expect(result.events.some((event) => event.type === 'shoot')).toBe(true);
    // La course a coute de l'energie (premieres briques d'Ardeur).
    expect(result.state.players.yanis!.energy).toBeLessThan(100);
  });

  it('applique le budget d intentions (3 majeures + 2 mineures)', () => {
    const state = installSixZero(createPilotMatch(44));
    const fourMajor: VolleyPlan = {
      team: 'nangis',
      orders: [
        { actorId: 'yanis', kind: 'pass', targetId: 'aaron' },
        { actorId: 'yanis', kind: 'fix', targetId: 'kael' },
        { actorId: 'yanis', kind: 'shoot' },
        { actorId: 'yanis', kind: 'attackSpace', targetPosition: { x: 30, y: 10 } }
      ]
    };
    expect(MAX_MAJOR_ORDERS).toBe(3);
    expect(() => validateVolleyPlan(state, fourMajor, HOLD_ALL)).toThrow();
  });

  it('refuse un tir ou une passe hors du porteur', () => {
    const state = installSixZero(createPilotMatch(44));
    const attack: VolleyPlan = {
      team: 'nangis',
      orders: [{ actorId: 'aaron', kind: 'shoot' }]
    };
    expect(() => validateVolleyPlan(state, attack, HOLD_ALL)).toThrow(/holder/i);
  });
});
