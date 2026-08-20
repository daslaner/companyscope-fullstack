# CompanyScope Product

Senior fullstack/product-engineering portfolio project for a global company-intelligence SaaS experience. The repository combines a production-minded React application, Node BFF, explicit security boundaries, product instrumentation, browser E2E coverage and an artifact-promotion CI/CD design.

**Author:** Deniz Aslaner

## What is implemented

- React 19 + strict TypeScript + Tailwind CSS 4
- 100 deterministic synthetic companies across 20 markets
- Recharts analytics with accessible text summaries and three contextual charts per company tab
- Leaflet geographic visualization with an equivalent keyboard-accessible list/table path
- Deep-linkable Overview, Financials, Operations, Security, People, Signals and feature-flagged Explainer routes
- Search, filtering, sorting, local-first saved-company research and portfolio comparison
- TanStack Query for authenticated server state and Explainer mutations
- Typed, vendor-neutral product analytics wired to decision points
- Feature flags that gate real product paths rather than documentation-only switches
- Node BFF with registration/login/logout/session APIs and a bounded OpenAI Responses API Explainer
- Opaque HttpOnly sessions, session-bound CSRF, exact Origin checks, scrypt password hashing, bounded bodies and separate rate limits
- Production SPA+BFF runtime with security headers, safe static path handling, health/revision metadata and graceful shutdown
- Vitest 90% coverage gates + Playwright production-runtime E2E
- Storybook + accessibility checks
- Parallel GitHub Actions quality gates, CodeQL, Dependency Review, Dependabot and full-SHA action pinning
- Build-once artifact promotion to GitHub Pages and a smoke-tested GHCR container
- Optional protected production deployment plus immutable-SHA rollback workflow

## Local development

Prerequisite: **Node.js 24.18.0**. The supported engine range is `>=24.15.0 <25` and `.nvmrc` is committed.

```bash
nvm install
nvm use
npm ci
cp .env.example .env
```

Run the BFF in one terminal:

```bash
npm run dev:api
```

Run the web app in a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173`, register a local account and use the protected workspace. Users and sessions intentionally live in memory for this reproducible portfolio reference and reset when the BFF restarts.

### AI Explainer

Set `OPENAI_API_KEY` in `.env` to enable the Explainer. The browser sends only an allow-listed company identifier and focus. The authenticated BFF validates Origin + CSRF, builds model context from trusted local data and keeps the provider credential server-side.

For a frontend-only preview, set `VITE_REMOTE_AUTH=false`; this activates the explicitly labelled token-free demo auth adapter. Production builds use same-origin BFF auth through the committed `.env.production` public build settings.

## Production build and container

```bash
npm run build:production
```

This creates:

```text
dist/                    # Vite browser build
server-dist/server.mjs   # bundled Node BFF + SPA server
```

Run it locally over HTTP for a smoke test:

```bash
APP_ORIGIN=http://127.0.0.1:4100 \
NODE_ENV=production \
SESSION_COOKIE_SECURE=false \
SERVE_STATIC=true \
npm run serve:production
```

The Dockerfile consumes only the built browser/BFF artifacts and runs as the non-root `node` user. Real HTTPS deployments should keep the default production `Secure` session cookie behavior.

## Product thesis

Company research is slow when evidence is fragmented and risk signals are hard to compare. CompanyScope turns a broad dataset into a progressive workflow: scan the market, narrow candidates, inspect categorized evidence, save/compare companies, and request a bounded explanation only when it helps a decision.

Product events are vendor-neutral and privacy-minimal. KPI values shown in the demo are explicitly labelled illustrative; the implementation demonstrates where trustworthy measurement is captured rather than pretending synthetic portfolio data is production telemetry.

## Architecture and security

The browser depends on typed ports and shared schemas. Authentication and model access cross the BFF trust boundary; secrets and session identifiers never enter client JavaScript. Route-level lazy loading keeps dashboard/detail-heavy dependencies out of unrelated route chunks, while TanStack Query owns server-state lifecycles.

The production Node process can serve both the SPA and `/api/*`. It prevents static path traversal, keeps API 404s distinct from SPA fallback, emits hardened response headers and reports its build commit from `/api/health` for deployment verification.

See `docs/architecture.md`, `docs/decision-log.md`, `docs/explainer.md`, `docs/metrics.md`, `docs/accessibility.md` and `SECURITY.md` for rationale and deliberate production-scale boundaries.

## Local quality gates

```bash
npm run verify
npm run audit:prod
```

`verify` runs ESLint, strict browser + BFF/tools + E2E TypeScript checks, Vitest V8 coverage with **90% minimum thresholds for lines, statements, functions and branches**, the production browser/BFF build and Storybook build.

For the full browser/runtime check:

```bash
npx playwright install chromium
npm run test:e2e:local
```

## CI/CD

GitHub CI parallelizes lint, typecheck, unit/coverage, production build, dependency audit, Playwright E2E and container smoke testing. A stable **`CI / Quality Gate`** aggregates those jobs for branch protection.

The browser/BFF and Storybook are built once in CI. Playwright and the container stage consume the verified production artifact. Successful `master` CI publishes that same smoke-tested container to GHCR under an immutable full commit SHA; Storybook Pages also downloads the exact CI artifact rather than rebuilding it.

Production deployment is deliberately provider-neutral and opt-in behind a protected GitHub Environment. When configured, deployment must report the exact expected commit through `/api/health`. A manual rollback workflow can redeploy a previously verified immutable SHA.

Third-party GitHub Actions are pinned to full commit SHAs and Dependabot keeps those pins reviewable.

After pushing the repository, apply the branch protection, Dependency Graph, Pages and optional production Environment settings in [`docs/github-repository-settings.md`](docs/github-repository-settings.md). Detailed workflow design is in [`docs/ci-cd.md`](docs/ci-cd.md).
