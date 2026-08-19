import { describe, expect, it, vi } from 'vitest';
import { isEnabled, type Flag } from './flags';

const expectedDefaults: Record<Flag, boolean> = {
  savedViews: true,
  riskExplainability: true,
  portfolioCompare: false,
  explainer: true,
};

describe('feature flags', () => {
  it.each(Object.entries(expectedDefaults) as [Flag, boolean][])('uses the default for %s', (flag, enabled) => {
    expect(isEnabled(flag)).toBe(enabled);
  });

  it('supports explicit true and false runtime overrides', () => {
    expect(isEnabled('savedViews', { savedViews: false })).toBe(false);
    expect(isEnabled('portfolioCompare', { portfolioCompare: true })).toBe(true);
  });

  it('does not let unrelated overrides change a flag', () => {
    expect(isEnabled('explainer', { savedViews: false })).toBe(true);
  });

  it('supports environment-backed rollout overrides while explicit overrides stay authoritative', () => {
    vi.stubEnv('VITE_FLAG_EXPLAINER', 'false');
    expect(isEnabled('explainer')).toBe(false);
    expect(isEnabled('explainer', { explainer: true })).toBe(true);
  });
});
