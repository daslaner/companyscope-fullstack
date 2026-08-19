import type { Company } from '../types/company';
import { riskBand } from './risk';

export type NamedValue = { name: string; value: number };
export type CohortPoint = { year: number; companies: number; revenueM: number; avgGrowthPct: number };
export type ScatterPoint = { name: string; revenueM: number; growthPct: number; riskScore: number };
export type RadarPoint = { metric: string; value: number; fullMark: 100 };

const average = (values: number[]) =>
  values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;

export function buildProfitabilityMix(companies: Company[]): NamedValue[] {
  const order: Company['profitability'][] = ['Profitable', 'Break-even', 'Investing for growth'];
  return order.map((name) => ({
    name,
    value: companies.filter((company) => company.profitability === name).length,
  }));
}

export function buildRiskDistribution(companies: Company[]): NamedValue[] {
  const order = ['Low', 'Moderate', 'Elevated'] as const;
  return order.map((name) => ({
    name,
    value: companies.filter((company) => riskBand(company.riskScore) === name).length,
  }));
}

export function buildFoundingCohorts(companies: Company[]): CohortPoint[] {
  const cohorts = new Map<number, Company[]>();
  companies.forEach((company) => {
    const bucket = Math.floor(company.founded / 3) * 3;
    cohorts.set(bucket, [...(cohorts.get(bucket) ?? []), company]);
  });

  return [...cohorts.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, cohort]) => ({
      year,
      companies: cohort.length,
      revenueM: Math.round(cohort.reduce((sum, company) => sum + company.revenueM, 0)),
      avgGrowthPct: Number(average(cohort.map((company) => company.growthPct)).toFixed(1)),
    }));
}

export function buildRevenueGrowthScatter(companies: Company[]): ScatterPoint[] {
  return companies.map((company) => ({
    name: company.name,
    revenueM: company.revenueM,
    growthPct: company.growthPct,
    riskScore: company.riskScore,
  }));
}

export function buildPortfolioHealth(companies: Company[]): RadarPoint[] {
  const verifiedPct = companies.length === 0
    ? 0
    : (companies.filter((company) => company.verified).length / companies.length) * 100;
  const avgSecurity = average(companies.map((company) => company.security.rating));
  const avgMfa = average(companies.map((company) => company.security.mfaCoveragePct));
  const avgUptime = average(companies.map((company) => company.operations.uptimePct));
  const avgGrowth = average(companies.map((company) => company.growthPct));
  const avgRisk = average(companies.map((company) => company.riskScore));

  return [
    { metric: 'Verified', value: Math.round(verifiedPct), fullMark: 100 },
    { metric: 'Security', value: Math.round(avgSecurity), fullMark: 100 },
    { metric: 'MFA', value: Math.round(avgMfa), fullMark: 100 },
    { metric: 'Reliability', value: Math.round(Math.min(100, Math.max(0, avgUptime))), fullMark: 100 },
    { metric: 'Growth', value: Math.round(Math.min(100, Math.max(0, 50 + avgGrowth * 1.5))), fullMark: 100 },
    { metric: 'Low risk', value: Math.round(Math.min(100, Math.max(0, 100 - avgRisk))), fullMark: 100 },
  ];
}

export function buildTrustCoverage(companies: Company[]): NamedValue[] {
  const verifiedPct = companies.length === 0
    ? 0
    : (companies.filter((company) => company.verified).length / companies.length) * 100;
  const avgMfa = average(companies.map((company) => company.security.mfaCoveragePct));
  const strongSecurityPct = companies.length === 0
    ? 0
    : (companies.filter((company) => company.security.rating >= 85).length / companies.length) * 100;

  return [
    { name: 'Verified records', value: Math.round(verifiedPct) },
    { name: 'Average MFA', value: Math.round(avgMfa) },
    { name: 'Strong security', value: Math.round(strongSecurityPct) },
  ];
}
