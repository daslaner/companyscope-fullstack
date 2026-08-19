# Company data model

CompanyScope ships with a deterministic local portfolio of **100 synthetic companies**: five reusable business profiles across 20 markets. The records exist only for product and engineering demonstration and do not claim to represent real companies.

Each company includes identity and geography, industry tags, employee and revenue proxies, growth/profitability, verification state, an aggregate risk score, operating footprint, security posture, people metrics and dated business signals.

## Why local deterministic data

- Reviewers can clone and evaluate the application without provisioning a third-party data account.
- Tests get stable IDs and values.
- The Leaflet map remains meaningful across multiple continents.
- The Explainer can be constrained to a known trusted snapshot rather than arbitrary browser text.

`northstar-berlin-security` is the canonical fixture used by route and component tests.
