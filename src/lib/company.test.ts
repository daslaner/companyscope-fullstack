import { describe, expect, it } from 'vitest';
import { companies } from '../data/companies';
import { companyTabs, formatCurrency, formatPercent, getCompany, isCompanyTab } from './company';

describe('company helpers', () => {
  it('defines stable routed tabs and validates tab identifiers', () => {
    expect(companyTabs.map((tab) => tab.id)).toEqual(['overview', 'financials', 'operations', 'security', 'people', 'signals', 'explainer']);
    expect(isCompanyTab('security')).toBe(true);
    expect(isCompanyTab('unknown')).toBe(false);
    expect(isCompanyTab(undefined)).toBe(false);
  });

  it('looks up companies and formats portfolio values', () => {
    expect(getCompany('northstar-berlin-security')?.name).toBe('Northstar Berlin Security');
    expect(getCompany('missing-company')).toBeUndefined();
    expect(getCompany(undefined)).toBeUndefined();
    expect(formatCurrency(123)).toMatch(/123/);
    expect(formatCurrency(123)).toContain('€');
    expect(formatPercent(12)).toBe('+12%');
    expect(formatPercent(0)).toBe('0%');
    expect(formatPercent(-4)).toBe('-4%');
    expect(companies).toHaveLength(100);
  });
});
