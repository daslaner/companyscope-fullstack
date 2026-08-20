# Contributing

CompanyScope is maintained as a production-minded portfolio codebase. Changes should stay small, reviewable and explainable.

## Before opening a pull request

1. Use the Node version from `.nvmrc`.
2. Install dependencies with `npm ci`; commit `package-lock.json` whenever dependency metadata changes.
3. Run `npm run verify` and `npm run audit:prod`.
4. For runtime, routing, auth or core workflow changes, run `npm run test:e2e:local` after installing Chromium with `npx playwright install chromium`.
5. Keep credentials in local environment files or GitHub Secrets only; never commit secrets, build output, coverage, Playwright reports or runtime artifacts.
6. Add tests for behavior changes, including failure and authorization boundaries where relevant.
7. Update architecture, security, operations or product documentation when a trade-off changes.

## Commit style

Prefer focused imperative Conventional-Commit-style messages, for example:

- `feat: add verified-company filtering`
- `fix: preserve company tab deep links`
- `test: cover explainer failure boundaries`
- `security: reject untrusted request origins`
- `ci: promote verified runtime artifacts`
- `docs: record rollout trade-offs`

Do not mix unrelated feature, test, workflow and documentation changes when they can be reviewed independently.

## Review expectations

A change is ready to merge only when the aggregate `CI / Quality Gate` is green and CodeQL passes. Dependency Review should also be required after the repository Dependency Graph is enabled.

The pull-request template asks for validation evidence plus security, accessibility, analytics/flag and rollout impact where relevant.
