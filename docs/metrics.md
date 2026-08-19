# Product metrics

## North-star proxy

**Useful company explorations per active workspace per week** — a company view followed by a meaningful action such as searching/filtering, saving research, opening a classified tab or requesting an explanation.

## Funnel

Visit → workspace created → first search → first useful company exploration → saved/revisited research → repeat research within 7 days.

## Implemented instrumentation

The vendor-neutral `AnalyticsPort` currently emits development events for:

- `workspace_created`
- `company_searched`
- `company_opened` with table/map/saved source
- `company_tab_opened`
- `company_saved`
- `explainer_requested`

Properties intentionally avoid search text, email addresses, model output and other sensitive content. A production adapter can replace `ConsoleAnalytics` without coupling product components to a vendor SDK.

## Demo KPI disclosure

The KPI cards in the portfolio are illustrative and display a visible **Demo metrics** badge. They describe the intended operating model; they are not represented as observed production measurements.

## Guardrails

Accessibility defects, auth failure rate, p95 interaction latency, error rate, misleading-risk feedback, unsupported model claims, security incidents and cost per completed research session.

## Explainer quality metrics

- Explanation request success rate
- Median time from company open to confident decision
- Share of explanations followed by a structured-tab revisit
- Unsupported-claim rate in a curated evaluation set
- Cost per completed research session
- Guardrail: task completion must not regress when the Explainer is unavailable
