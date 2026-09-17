import { simulateMatch } from './simulation.js';

export interface SeedCampaignReport {
  runs: number;
  nangisWins: number;
  lagnyWins: number;
  draws: number;
  distinctScores: number;
  adaptations: number;
  averageEvents: number;
  passed: boolean;
}

export function runSeedCampaign(startSeed = 1, runs = 100): SeedCampaignReport {
  let nangisWins = 0;
  let lagnyWins = 0;
  let draws = 0;
  let eventTotal = 0;
  const scores = new Set<string>();
  let adaptations = 0;
  for (let offset = 0; offset < runs; offset += 1) {
    const run = simulateMatch(startSeed + offset, 120);
    const nangis = run.state.teams.nangis.score;
    const lagny = run.state.teams.lagny.score;
    scores.add(`${nangis}-${lagny}`);
    eventTotal += run.state.events.length;
    adaptations += run.state.events.filter((event) => event.type === 'defensive-adaptation').length;
    if (nangis > lagny) nangisWins += 1;
    else if (lagny > nangis) lagnyWins += 1;
    else draws += 1;
  }
  const report: SeedCampaignReport = {
    runs,
    nangisWins,
    lagnyWins,
    draws,
    distinctScores: scores.size,
    adaptations,
    averageEvents: eventTotal / runs,
    passed: nangisWins > 0 && lagnyWins > 0 && scores.size >= 3 && adaptations > 0
  };
  return report;
}
