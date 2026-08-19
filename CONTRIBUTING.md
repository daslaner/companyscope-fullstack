# Contributing

CompanyScope is maintained as a production-minded portfolio codebase. Changes should stay small, reviewable and explainable.

## Before opening a pull request

1. Use the Node version from `.nvmrc`.
2. Install dependencies and commit `package-lock.json` so CI can use reproducible `npm ci` installs.
3. Run `npm run verify` from the repository root.
4. Keep credentials in local environment files only; never commit secrets or generated coverage/build output.
5. Add tests for behavior changes, including failure and authorization boundaries where relevant.
6. Update architecture, security or product documentation when a trade-off changes.

## Commit style

Prefer focused imperative commits, for example:

- `feat: add verified-company filtering`
- `fix: preserve company tab deep links`
- `test: cover explainer failure boundaries`
- `security: reject untrusted request origins`
- `docs: record rollout trade-offs`

## Review expectations

A change is ready to merge only when linting, TypeScript, the 90% coverage gate, production build, Storybook build, dependency review and static security analysis are green.
