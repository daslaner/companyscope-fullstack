export type Flag = 'savedViews' | 'riskExplainability' | 'portfolioCompare' | 'explainer';

const defaults: Record<Flag, boolean> = {
  savedViews: true,
  riskExplainability: true,
  portfolioCompare: false,
  explainer: true,
};

const envNames: Record<Flag, string> = {
  savedViews: 'VITE_FLAG_SAVED_VIEWS',
  riskExplainability: 'VITE_FLAG_RISK_EXPLAINABILITY',
  portfolioCompare: 'VITE_FLAG_PORTFOLIO_COMPARE',
  explainer: 'VITE_FLAG_EXPLAINER',
};

function envOverride(flag: Flag): boolean | undefined {
  const value = import.meta.env[envNames[flag]];
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

export const isEnabled = (flag: Flag, overrides: Partial<Record<Flag, boolean>> = {}) =>
  overrides[flag] ?? envOverride(flag) ?? defaults[flag];
