import { describe, expect, it } from 'vitest';
import { companies } from '../data/companies';
import type { Company, CompanyTab } from '../types/company';
import { buildCompanyDetailCharts } from './detailChartData';

const tabs: CompanyTab[] = ['overview', 'financials', 'operations', 'security', 'people', 'signals', 'explainer'];
const company = companies[0];

if (!company) {
  throw new Error('Expected the local company dataset to contain at least one company.');
}

describe('buildCompanyDetailCharts', () => {
  it.each(tabs)('builds three complete chart datasets for %s', (tab) => {
    const charts = buildCompanyDetailCharts(company, tab);

    expect(charts.bar.data.length).toBeGreaterThan(0);
    expect(charts.line.data.length).toBeGreaterThan(0);
    expect(charts.pie.data.length).toBeGreaterThan(0);
    expect(charts.bar.id).toContain(tab);
    expect(charts.line.id).toContain(tab);
    expect(charts.pie.id).toContain(tab);

    for (const value of [
      ...charts.bar.data.map((item) => item.value),
      ...charts.line.data.map((item) => item.value),
      ...charts.pie.data.map((item) => item.value),
    ]) {
      expect(Number.isFinite(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps percentage compositions internally coherent', () => {
    const operations = buildCompanyDetailCharts(company, 'operations');
    const security = buildCompanyDetailCharts(company, 'security');
    const people = buildCompanyDetailCharts(company, 'people');
    const financials = buildCompanyDetailCharts(company, 'financials');

    expect(operations.pie.data.reduce((sum, item) => sum + item.value, 0)).toBe(100);
    expect(security.pie.data.reduce((sum, item) => sum + item.value, 0)).toBe(100);
    expect(people.pie.data.reduce((sum, item) => sum + item.value, 0)).toBe(100);
    expect(financials.pie.data.reduce((sum, item) => sum + item.value, 0)).toBe(100);
  });

  it('keeps security and explainer readiness scores within a 100-point scale', () => {
    for (const tab of ['security', 'explainer'] as const) {
      const charts = buildCompanyDetailCharts(company, tab);
      for (const point of charts.bar.data) {
        expect(point.value).toBeGreaterThanOrEqual(0);
        expect(point.value).toBeLessThanOrEqual(100);
      }
    }
  });

  it.each([
    ['Profitable', 'Hybrid', 'Watch', true],
    ['Break-even', 'Office-first', 'Changed recently', false],
    ['Investing for growth', 'Remote-first', 'Stable', true],
  ] as const)(
    'covers %s profitability and %s people-policy branches',
    (profitability, remotePolicy, leadershipStability, verified) => {
      const variant: Company = {
        ...company,
        profitability,
        verified,
        people: { ...company.people, remotePolicy, leadershipStability },
      };

      const financials = buildCompanyDetailCharts(variant, 'financials');
      const people = buildCompanyDetailCharts(variant, 'people');
      const overview = buildCompanyDetailCharts(variant, 'overview');
      const explainer = buildCompanyDetailCharts(variant, 'explainer');

      expect(financials.pie.data.reduce((sum, item) => sum + item.value, 0)).toBe(100);
      expect(people.bar.data).toHaveLength(3);
      expect(overview.bar.data.find((item) => item.label === 'Trust')?.value).toBe(verified ? 100 : 58);
      expect(explainer.bar.data.find((item) => item.label === 'Data quality')?.value).toBe(verified ? 100 : 65);
    },
  );

  it('handles an invalid evidence date defensively', () => {
    const invalidDateCompany = {
      ...company,
      security: { ...company.security, lastAssessment: 'not-a-date' },
    };
    const charts = buildCompanyDetailCharts(invalidDateCompany, 'explainer');

    expect(charts.line.data[0]).toEqual({ label: 'Assessment', value: 0 });
  });
});
