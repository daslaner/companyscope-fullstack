import { describe, expect, it } from 'vitest';
import { companies } from './companies';

describe('local company dataset', () => {
  it('contains exactly 100 unique globally distributed companies', () => {
    expect(companies).toHaveLength(100);
    expect(new Set(companies.map((company) => company.id)).size).toBe(100);
    expect(new Set(companies.map((company) => company.country)).size).toBeGreaterThanOrEqual(20);
  });
});
