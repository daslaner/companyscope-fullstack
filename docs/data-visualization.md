# Data Visualization

CompanyScope uses Recharts 3 for portfolio analytics. The visualization layer is intentionally derived from the same deterministic 100-company dataset used by the map, table and detail routes, so every view can be reproduced locally without a remote analytics service.

## Seven chart families

1. **Bar — Risk band distribution:** compares company counts across low, moderate and elevated composite-risk bands.
2. **Donut/Pie — Profitability mix:** shows the part-to-whole split between profitable, break-even and investing-for-growth companies.
3. **Line — Growth by founding cohort:** compares average growth proxies across ordered three-year founding cohorts.
4. **Area — Revenue by founding cohort:** shows aggregate estimated revenue represented by each cohort.
5. **Scatter — Revenue vs. growth:** plots all 100 companies to surface scale/growth outliers and clusters.
6. **Radar — Portfolio health:** normalizes verification, security, MFA, reliability, growth and low-risk indicators to a 0–100 scale.
7. **Radial bar — Trust coverage:** compares portfolio-wide verification, MFA and strong-security coverage.


## Company detail analytics

Every company detail route adds **three tab-specific charts** below the classified facts. With seven tabs this produces **21 detail visualizations per company** while keeping the chart grammar predictable: a comparison bar, an ordered line/proxy trend, and a part-to-whole donut.

| Tab | Bar | Line | Donut |
| --- | --- | --- | --- |
| Overview | Company scorecard | Health trajectory proxy | Evidence mix |
| Financials | Revenue scenarios | Revenue trajectory proxy | Operating posture proxy |
| Operations | Operating footprint | Uptime stability proxy | Vendor concentration |
| Security | Security control posture | Security posture proxy | MFA coverage |
| People | Talent signals | Headcount trajectory proxy | Workforce mix |
| Signals | Signal severity | Attention sequence | Attention share |
| Explainer | Explainer readiness | Evidence freshness | Structured context mix |

Proxy series are deterministic transformations of the local snapshot and are labelled as proxies in the UI. They are never presented as reported historical facts. Pure builders live in `src/lib/detailChartData.ts`; rendering lives in `src/components/CompanyDetailAnalytics.tsx`.

## Engineering decisions

- Pie sectors use the Recharts `shape` API rather than deprecated `Cell` elements. Custom shapes forward only normalized geometry props into `Sector`, which stays compatible with strict `exactOptionalPropertyTypes`.

- Chart data is prepared in pure TypeScript functions in `src/lib/chartData.ts` and unit-tested independently from rendering.
- The React rendering layer is isolated in `src/components/PortfolioAnalytics.tsx` and has a Storybook story.
- Recharts v3 keeps its accessibility layer enabled; every chart is also wrapped in a semantic `figure` with title, description and a screen-reader-only textual summary.
- Chart colors are CSS custom properties with separate light/dark values, so theme changes do not require JavaScript chart reconfiguration.
- Tooltips, axes and legends use a shared visual language and keep values formatted in their domain units.
- Reduced-motion preferences continue to be respected by the global UI stylesheet.
- Chart source files remain inside the repository's Vitest V8 coverage denominator and therefore contribute to the 90% quality gate.

## Testing strategy

`src/lib/chartData.test.ts` validates aggregation invariants, ordered cohorts, normalization and empty-state behavior. `src/components/PortfolioAnalytics.test.tsx` validates the seven chart surfaces and accessible context. Recharts itself is treated as a third-party rendering dependency; tests mock its primitives so CompanyScope tests remain deterministic and focus on application behavior rather than re-testing the library.
