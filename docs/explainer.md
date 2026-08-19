# Company Explainer

The Explainer turns an existing structured CompanyScope record into a concise briefing. It supports four bounded modes: executive, risk, growth and security.

## Trust boundary

The browser sends only:

```json
{ "companyId": "northstar-berlin-security", "focus": "security" }
```

The request is available only to an authenticated session and must include the session-bound CSRF token plus the exact trusted Origin. The BFF validates both input fields against an allowlist, looks up the company in the trusted local dataset and constructs model input itself. Free-form user prompts are intentionally not accepted.

The API key is read only from server environment variables. Model calls use the Responses API with response storage disabled and a bounded output budget. Model output is treated as generated interpretation, never as a replacement for the structured source fields.

## Abuse and failure behavior

The endpoint has its own per-user in-memory request budget, a 4 KiB body limit and controlled 4xx/5xx responses. Missing provider configuration, upstream failures and empty responses do not break the rest of the company-detail experience.

## Production extensions

A production system should move quotas/rate limits to shared infrastructure, add request tracing without sensitive payload logging, provider usage telemetry, quality evaluation datasets, cost budgets, abuse monitoring and an explicit retention policy.
