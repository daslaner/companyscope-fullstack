# Testing strategy

CompanyScope treats security boundaries, product instrumentation and rollout logic as first-class behavior. Vitest + V8 coverage enforce a **90% minimum for lines, statements, functions and branches**.

`coverage.include` explicitly accounts for source modules that tests never import, so the threshold cannot be met by testing only utilities that happen to execute.

## Covered behavior

- company discovery, search/filter/sort and routed detail exploration
- contextual chart data and accessible chart descriptions
- visual map plus semantic list/table alternative contracts
- theme and saved-company persistence, including blocked browser storage
- saved-research dashboard workflow
- explicit auth states: checking, authenticated, anonymous and retryable infrastructure failure
- remote client boundary: credentialed cookies, CSRF propagation, 401 vs 5xx behavior and logout confirmation
- auth core: salted scrypt hashing, opaque sessions, CSRF verification, expiry, cookie attributes and repository boundaries
- typed analytics enablement and product-event contracts
- feature flags and outcome/rollout presentation
- Explainer success/failure paths and strict model-input allowlist
- BFF security core: trusted-origin headers, bounded/swept rate limiting and trusted local snapshots

## Local quality gate

```bash
npm run verify
npm run audit:prod
```

`verify` combines linting, browser + tools TypeScript checks, coverage, the Vite production build and Storybook. CI executes the same gate on the Node version pinned by `.nvmrc`.
