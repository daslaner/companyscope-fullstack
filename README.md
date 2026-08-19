# CompanyScope Product

Senior fullstack/product-engineering portfolio project for a global company-intelligence SaaS experience. The repository combines a production-minded React application with a local Node BFF, explicit security boundaries, product instrumentation, feature delivery controls and documented trade-offs.

**Author:** Deniz Aslaner

## What is implemented

- React 19 + strict TypeScript + Tailwind CSS 4
- 100 deterministic synthetic companies across 20 markets
- Recharts analytics with accessible text summaries and three contextual charts per company tab
- Leaflet geographic visualization with an equivalent keyboard-accessible list/table path
- Deep-linkable Overview, Financials, Operations, Security, People, Signals and feature-flagged Explainer routes
- Search, filtering, sorting and a local-first saved-company shortlist
- TanStack Query for authenticated server state and Explainer mutations
- Typed product analytics wired to search, company opens, tabs, saves, workspace creation and Explainer requests
- Feature flags for saved views, risk explainability, portfolio compare and the AI Explainer
- Local Node BFF with registration/login/logout/session endpoints and the OpenAI Responses API Explainer
- Opaque HttpOnly sessions, session-bound CSRF, exact Origin checks, scrypt password hashing, bounded bodies and separate rate limits
- Storybook + accessibility checks + strict test coverage + GitHub Actions + CodeQL + Dependency Review + Dependabot

## Local development

Prerequisite: **Node.js 24.18.0 LTS**. The supported engine range is `>=24.15.0 <25` and `.nvmrc` is committed.

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

Set `OPENAI_API_KEY` in `.env` to enable the Explainer. The browser sends only an allow-listed company identifier and focus. The authenticated BFF validates Origin + CSRF, builds the model context from trusted local data and keeps the provider credential server-side.

For a frontend-only preview, set `VITE_REMOTE_AUTH=false`; this activates the explicitly labeled token-free demo auth adapter while leaving production-shaped auth code in the repo.

## Product thesis

Company research is slow when evidence is fragmented and risk signals are hard to compare. CompanyScope turns a broad dataset into a progressive workflow: scan the market, narrow candidates, inspect categorized evidence, save companies, and request a bounded explanation only when it helps a decision.

Product events are vendor-neutral and privacy-minimal. KPI values shown in the demo are explicitly labelled illustrative; the implementation demonstrates where trustworthy measurement is captured rather than pretending synthetic portfolio data is production telemetry.

## Architecture

The browser depends on typed ports and shared schemas. Authentication and model access cross the local BFF boundary; secrets and session identifiers never enter client JavaScript. Route-level lazy loading keeps dashboard/detail-heavy dependencies out of unrelated route chunks, while TanStack Query owns server-state lifecycles.

See `docs/architecture.md`, `docs/decision-log.md`, `docs/explainer.md`, `docs/metrics.md`, `docs/accessibility.md` and `SECURITY.md` for the rationale and production scale boundaries.

## Quality gate

```bash
npm run verify
npm run audit:prod
```

`verify` runs ESLint, strict browser + tools TypeScript checks, Vitest V8 coverage with **90% minimum thresholds for lines, statements, functions and branches**, the production Vite build and Storybook build. Source modules are explicitly included in the coverage denominator so unimported files cannot silently escape measurement.

## CI/CD

The committed `package-lock.json` is used with `npm ci` in GitHub Actions. CI runs the same verification gate and a production dependency audit. Separate least-privilege workflows provide CodeQL and high-severity Dependency Review; Dependabot covers npm and GitHub Actions updates. Storybook deploys to GitHub Pages only after the `main` CI workflow succeeds, and the deploy checks out the exact verified commit SHA.
