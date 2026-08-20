# Testing strategy

CompanyScope treats security boundaries, user journeys, product instrumentation and rollout logic as first-class behavior.

## Unit and integration layer

Vitest + V8 coverage enforce a **90% minimum for lines, statements, functions and branches**. `coverage.include` explicitly accounts for source modules that tests never import, so the threshold cannot be met by testing only utilities that happen to execute.

Covered behavior includes:

- company discovery, search/filter/sort and routed detail exploration;
- contextual chart data and accessible chart descriptions;
- visual map plus semantic list/table alternative contracts;
- theme and saved-company persistence, including unavailable browser storage;
- saved-research dashboard workflow;
- explicit auth states: checking, authenticated, anonymous and retryable infrastructure failure;
- credentialed API behavior, CSRF propagation, 401 vs 5xx handling and logout confirmation;
- auth core: salted scrypt hashing, opaque sessions, CSRF verification, expiry and cookie attributes;
- typed analytics events and feature-flag behavior;
- Explainer success/failure paths and strict model-input allowlists;
- BFF security core: trusted-origin headers, body limits, rate limiting and trusted local snapshots;
- production static serving: path traversal rejection, content types, CSP/security headers and cache policy.

## Browser E2E layer

Playwright runs Chromium against the **built production application + bundled BFF**, not the Vite development server. Critical smoke journeys verify:

- SPA deep links are served by the production runtime;
- hardened document headers are present;
- registration establishes a server session;
- the opaque session cookie is HttpOnly and unavailable through `document.cookie`;
- a user can open and save a company, then see it in the workspace;
- logout returns the UI to an anonymous state;
- a state-changing API call with an untrusted Origin is rejected.

CI installs only Chromium and its OS dependencies. On failure, Playwright traces/screenshots/videos are uploaded as short-lived diagnostics.

## Local gates

Install the browser once after `npm ci`:

```bash
npx playwright install chromium
```

Fast pre-push gate:

```bash
npm run verify
npm run audit:prod
```

Full runtime/browser gate:

```bash
npm run test:e2e:local
```

The GitHub CI workflow parallelizes these concerns, then exposes one stable `CI / Quality Gate` status for branch protection.
