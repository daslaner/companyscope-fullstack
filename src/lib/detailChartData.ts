import type { Company, CompanyTab } from '../types/company';

export type DetailBarPoint = { label: string; value: number };
export type DetailLinePoint = { label: string; value: number };
export type DetailPiePoint = { name: string; value: number };

export type DetailChartBundle = {
  bar: {
    id: string;
    title: string;
    description: string;
    suffix: string;
    data: DetailBarPoint[];
  };
  line: {
    id: string;
    title: string;
    description: string;
    suffix: string;
    data: DetailLinePoint[];
  };
  pie: {
    id: string;
    title: string;
    description: string;
    suffix: string;
    data: DetailPiePoint[];
  };
};

const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'] as const;
const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'] as const;
const years = ['2021', '2022', '2023', '2024', '2025', '2026'] as const;
const snapshotDate = Date.UTC(2026, 7, 19);

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round = (value: number, precision = 0) => Number(value.toFixed(precision));

function buildTrend(
  current: number,
  changeAcrossWindowPct: number,
  labels: readonly string[],
  precision = 0,
): DetailLinePoint[] {
  const denominator = Math.max(1, labels.length - 1);

  return labels.map((label, index) => {
    const progress = index / denominator;
    const startFactor = 1 - changeAcrossWindowPct / 100;
    const factor = startFactor + (1 - startFactor) * progress;
    return { label, value: round(Math.max(0, current * factor), precision) };
  });
}

function operatingPosture(company: Company): DetailPiePoint[] {
  switch (company.profitability) {
    case 'Profitable':
      return [
        { name: 'Operating capacity', value: 62 },
        { name: 'Growth investment', value: 26 },
        { name: 'Resilience reserve', value: 12 },
      ];
    case 'Break-even':
      return [
        { name: 'Operating capacity', value: 50 },
        { name: 'Growth investment', value: 38 },
        { name: 'Resilience reserve', value: 12 },
      ];
    case 'Investing for growth':
      return [
        { name: 'Operating capacity', value: 40 },
        { name: 'Growth investment', value: 50 },
        { name: 'Resilience reserve', value: 10 },
      ];
  }
}

function signalSeverityValue(severity: Company['signals'][number]['severity']) {
  if (severity === 'critical') return 100;
  if (severity === 'watch') return 60;
  return 25;
}

function freshnessScore(date: string) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  if (!Number.isFinite(timestamp)) return 0;
  const ageDays = Math.max(0, Math.round((snapshotDate - timestamp) / 86_400_000));
  return clamp(100 - ageDays * 2.5);
}

export function buildCompanyDetailCharts(company: Company, tab: CompanyTab): DetailChartBundle {
  switch (tab) {
    case 'overview': {
      const healthCurrent = clamp(
        (company.security.rating + (100 - company.riskScore) + clamp(55 + company.growthPct)) / 3,
      );

      return {
        bar: {
          id: 'overview-scorecard',
          title: 'Company scorecard',
          description: 'Normalized growth, security and trust signals from the local company snapshot.',
          suffix: '/100',
          data: [
            { label: 'Momentum', value: round(clamp(55 + company.growthPct * 1.4)) },
            { label: 'Security', value: company.security.rating },
            { label: 'Trust', value: company.verified ? 100 : 58 },
          ],
        },
        line: {
          id: 'overview-health-trend',
          title: 'Health trajectory proxy',
          description: 'Derived six-month directional proxy anchored to the current company health score.',
          suffix: '/100',
          data: buildTrend(healthCurrent, clamp(company.growthPct / 2, -12, 18), months),
        },
        pie: {
          id: 'overview-evidence-mix',
          title: 'Evidence mix',
          description: 'Structured evidence fields available across core company-intelligence domains.',
          suffix: ' fields',
          data: [
            { name: 'Financial', value: 6 },
            { name: 'Operations', value: 5 },
            { name: 'Security', value: 6 },
            { name: 'People', value: 5 },
            { name: 'Signals', value: company.signals.length },
          ],
        },
      };
    }

    case 'financials': {
      const growthRate = clamp(company.growthPct, -20, 45) / 100;
      const revenueTrend = years.map((label, index) => {
        const yearsBack = years.length - 1 - index;
        const denominator = Math.pow(Math.max(0.35, 1 + growthRate), yearsBack);
        return { label, value: round(company.revenueM / denominator, 1) };
      });

      return {
        bar: {
          id: 'financials-scenarios',
          title: 'Revenue scenarios',
          description: 'One-year revenue scenarios derived from the current revenue and growth snapshot.',
          suffix: 'M EUR',
          data: [
            { label: 'Downside', value: round(company.revenueM * (1 + (company.growthPct - 8) / 100), 1) },
            { label: 'Base', value: round(company.revenueM * (1 + company.growthPct / 100), 1) },
            { label: 'Upside', value: round(company.revenueM * (1 + (company.growthPct + 8) / 100), 1) },
          ].map((item) => ({ ...item, value: Math.max(0, item.value) })),
        },
        line: {
          id: 'financials-revenue-trend',
          title: 'Revenue trajectory proxy',
          description: 'Derived historical proxy anchored to the current estimated revenue; not reported history.',
          suffix: 'M EUR',
          data: revenueTrend,
        },
        pie: {
          id: 'financials-operating-posture',
          title: 'Operating posture proxy',
          description: `Illustrative allocation consistent with the “${company.profitability}” classification.`,
          suffix: '%',
          data: operatingPosture(company),
        },
      };
    }

    case 'operations':
      return {
        bar: {
          id: 'operations-footprint',
          title: 'Operating footprint',
          description: 'Physical and cloud footprint represented in the local company profile.',
          suffix: '',
          data: [
            { label: 'Offices', value: company.operations.offices },
            { label: 'Countries', value: company.operations.countries },
            { label: 'Cloud regions', value: company.operations.cloudRegions },
          ],
        },
        line: {
          id: 'operations-uptime',
          title: 'Uptime stability proxy',
          description: 'Derived six-month stability curve anchored to the current uptime percentage.',
          suffix: '%',
          data: months.map((label, index) => ({
            label,
            value: round(clamp(company.operations.uptimePct - (months.length - 1 - index) * 0.015, 98, 100), 2),
          })),
        },
        pie: {
          id: 'operations-vendor-concentration',
          title: 'Vendor concentration',
          description: 'Current vendor concentration compared with the diversified share.',
          suffix: '%',
          data: [
            { name: 'Largest-vendor exposure', value: company.operations.vendorConcentrationPct },
            { name: 'Diversified exposure', value: 100 - company.operations.vendorConcentrationPct },
          ],
        },
      };

    case 'security':
      return {
        bar: {
          id: 'security-controls',
          title: 'Security control posture',
          description: 'Security rating, MFA adoption and inverse composite risk on a common 100-point scale.',
          suffix: '/100',
          data: [
            { label: 'Security rating', value: company.security.rating },
            { label: 'MFA coverage', value: company.security.mfaCoveragePct },
            { label: 'Risk resilience', value: 100 - company.riskScore },
          ],
        },
        line: {
          id: 'security-posture-trend',
          title: 'Security posture proxy',
          description: 'Derived six-month posture curve anchored to the latest security rating.',
          suffix: '/100',
          data: buildTrend(
            company.security.rating,
            clamp(8 - company.security.openFindings * 1.5 - company.security.incidents90d * 3, -10, 10),
            months,
          ).map((point) => ({ ...point, value: round(clamp(point.value)) })),
        },
        pie: {
          id: 'security-mfa-coverage',
          title: 'MFA coverage',
          description: 'Covered identities versus the remaining MFA adoption gap.',
          suffix: '%',
          data: [
            { name: 'MFA covered', value: company.security.mfaCoveragePct },
            { name: 'Coverage gap', value: 100 - company.security.mfaCoveragePct },
          ],
        },
      };

    case 'people': {
      const remoteEnablement = company.people.remotePolicy === 'Remote-first' ? 100 : company.people.remotePolicy === 'Hybrid' ? 78 : 52;
      const leadershipScore = company.people.leadershipStability === 'Stable' ? 95 : company.people.leadershipStability === 'Watch' ? 65 : 45;

      return {
        bar: {
          id: 'people-talent-signals',
          title: 'Talent signals',
          description: 'Normalized engineering, remote-work and leadership indicators.',
          suffix: '/100',
          data: [
            { label: 'Engineering mix', value: company.people.engineeringSharePct },
            { label: 'Remote enablement', value: remoteEnablement },
            { label: 'Leadership stability', value: leadershipScore },
          ],
        },
        line: {
          id: 'people-headcount-trend',
          title: 'Headcount trajectory proxy',
          description: 'Derived six-quarter trajectory anchored to current headcount and headcount growth.',
          suffix: ' people',
          data: buildTrend(company.employees, clamp(company.people.headcountGrowthPct, -20, 40), quarters),
        },
        pie: {
          id: 'people-workforce-mix',
          title: 'Workforce mix',
          description: 'Engineering share versus the rest of the workforce.',
          suffix: '%',
          data: [
            { name: 'Engineering', value: company.people.engineeringSharePct },
            { name: 'Other functions', value: 100 - company.people.engineeringSharePct },
          ],
        },
      };
    }

    case 'signals': {
      const severityCounts = { info: 0, watch: 0, critical: 0 };
      company.signals.forEach((signal) => {
        severityCounts[signal.severity] += 1;
      });

      return {
        bar: {
          id: 'signals-severity',
          title: 'Signal severity',
          description: 'Current signal count by review severity.',
          suffix: '',
          data: [
            { label: 'Info', value: severityCounts.info },
            { label: 'Watch', value: severityCounts.watch },
            { label: 'Critical', value: severityCounts.critical },
          ],
        },
        line: {
          id: 'signals-attention',
          title: 'Attention sequence',
          description: 'Signal urgency in observed order, normalized to a 100-point attention scale.',
          suffix: '/100',
          data: [...company.signals]
            .sort((left, right) => left.observedAt.localeCompare(right.observedAt))
            .map((signal, index) => ({ label: `Signal ${index + 1}`, value: signalSeverityValue(signal.severity) })),
        },
        pie: {
          id: 'signals-attention-share',
          title: 'Attention share',
          description: 'Relative review attention implied by each current signal severity.',
          suffix: ' pts',
          data: company.signals.map((signal) => ({ name: signal.label, value: signalSeverityValue(signal.severity) })),
        },
      };
    }

    case 'explainer': {
      const recencyData = [
        { label: 'Assessment', value: freshnessScore(company.security.lastAssessment) },
        ...company.signals.map((signal, index) => ({
          label: `Signal ${index + 1}`,
          value: freshnessScore(signal.observedAt),
        })),
      ];

      return {
        bar: {
          id: 'explainer-readiness',
          title: 'Explainer readiness',
          description: 'Quality signals that bound the structured context supplied to the explainer.',
          suffix: '/100',
          data: [
            { label: 'Data quality', value: company.verified ? 100 : 65 },
            { label: 'Security evidence', value: company.security.rating },
            { label: 'Operational evidence', value: round(clamp(company.operations.uptimePct)) },
          ],
        },
        line: {
          id: 'explainer-recency',
          title: 'Evidence freshness',
          description: 'Recency score for the latest assessment and company signals at the portfolio snapshot date.',
          suffix: '/100',
          data: recencyData,
        },
        pie: {
          id: 'explainer-context-mix',
          title: 'Structured context mix',
          description: 'Relative field counts available to the bounded explainer context builder.',
          suffix: ' fields',
          data: [
            { name: 'Company', value: 8 },
            { name: 'Operations', value: 5 },
            { name: 'Security', value: 6 },
            { name: 'People', value: 5 },
            { name: 'Signals', value: company.signals.length },
          ],
        },
      };
    }
  }
}
