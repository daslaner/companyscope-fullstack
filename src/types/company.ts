export type RiskBand = 'Low' | 'Moderate' | 'Elevated';
export type SignalSeverity = 'info' | 'watch' | 'critical';
export type CompanyTab = 'overview' | 'financials' | 'operations' | 'security' | 'people' | 'signals' | 'explainer';
export type ExplainerFocus = 'executive' | 'risk' | 'growth' | 'security';

export type CompanySignal = {
  id: string;
  label: string;
  detail: string;
  severity: SignalSeverity;
  observedAt: string;
};

export type Company = {
  id: string;
  name: string;
  legalName: string;
  domain: string;
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lng: number;
  industry: string;
  founded: number;
  employees: number;
  revenueBand: string;
  revenueM: number;
  growthPct: number;
  profitability: 'Profitable' | 'Break-even' | 'Investing for growth';
  fundingStage: string;
  riskScore: number;
  verified: boolean;
  tags: string[];
  description: string;
  operations: {
    offices: number;
    countries: number;
    cloudRegions: number;
    uptimePct: number;
    vendorConcentrationPct: number;
  };
  security: {
    rating: number;
    mfaCoveragePct: number;
    openFindings: number;
    criticalFindings: number;
    incidents90d: number;
    certifications: string[];
    lastAssessment: string;
  };
  people: {
    headcountGrowthPct: number;
    engineeringSharePct: number;
    openRoles: number;
    remotePolicy: 'Remote-first' | 'Hybrid' | 'Office-first';
    leadershipStability: 'Stable' | 'Watch' | 'Changed recently';
  };
  signals: CompanySignal[];
};
