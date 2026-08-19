import { describe, expect, it } from 'vitest';
import { companies } from '../data/companies';
import {
  buildFoundingCohorts,
  buildPortfolioHealth,
  buildProfitabilityMix,
  buildRevenueGrowthScatter,
  buildRiskDistribution,
  buildTrustCoverage,
} from './chartData';

describe('chart data builders', () => {
  it('preserves all companies across categorical distributions', () => {
    expect(buildProfitabilityMix(companies).reduce((sum, item) => sum + item.value, 0)).toBe(100);
    expect(buildRiskDistribution(companies).reduce((sum, item) => sum + item.value, 0)).toBe(100);
  });

  it('builds ordered founding cohorts with finite metrics', () => {
    const cohorts = buildFoundingCohorts(companies);
    expect(cohorts.length).toBeGreaterThan(4);
    expect(cohorts).toEqual([...cohorts].sort((a, b) => a.year - b.year));
    expect(cohorts.every((item) => Number.isFinite(item.revenueM) && Number.isFinite(item.avgGrowthPct))).toBe(true);
  });

  it('maps all companies into the revenue-growth scatter dataset', () => {
    const points = buildRevenueGrowthScatter(companies);
    expect(points).toHaveLength(100);
    expect(points[0]).toEqual(expect.objectContaining({ name: expect.any(String), revenueM: expect.any(Number) }));
  });

  it('normalizes portfolio health and trust coverage to percentage scales', () => {
    const health = buildPortfolioHealth(companies);
    const trust = buildTrustCoverage(companies);
    expect(health).toHaveLength(6);
    expect(trust).toHaveLength(3);
    expect([...health, ...trust].every((item) => item.value >= 0 && item.value <= 100)).toBe(true);
  });

  it('returns safe empty-state aggregates', () => {
    expect(buildFoundingCohorts([])).toEqual([]);
    expect(buildRevenueGrowthScatter([])).toEqual([]);
    expect(buildProfitabilityMix([]).every((item) => item.value === 0)).toBe(true);
    expect(buildRiskDistribution([]).every((item) => item.value === 0)).toBe(true);
    expect(buildPortfolioHealth([]).every((item) => item.value >= 0 && item.value <= 100)).toBe(true);
    expect(buildTrustCoverage([]).every((item) => item.value === 0)).toBe(true);
  });
});
