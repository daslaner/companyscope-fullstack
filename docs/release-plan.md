# Release strategy

## Product slices

### Slice 1 — Research foundation
Search, table, detail-ready data model and accessibility baseline.

### Slice 2 — Geographic context
Leaflet map with a non-map equivalent and resilient tile failure behavior.

### Slice 3 — Secure workspace
Registration, sign-in, session boundary, CSRF and security documentation.

### Slice 4 — Learn and iterate
Feature flags, product events, activation funnel, saved research, portfolio comparison and usability feedback.

Each product slice is independently demoable, testable and tied to a user outcome.

## Operational release flow

A change reaches a release channel only after the aggregate CI Quality Gate passes. CI creates the browser/BFF bundle once, runs Playwright against it, packages it into the runtime container, smoke-tests that container and exports the tested image.

Successful `master` builds promote the tested image to GHCR under its full commit SHA. Moving `master`/`latest` tags are convenience pointers; deployments and rollbacks use immutable SHA tags.

Production deployment is provider-neutral and opt-in behind a protected GitHub Environment. A deployment is complete only when `/api/health` reports both healthy status and the expected commit SHA. The manual rollback workflow accepts a previously verified SHA and applies the same post-deployment revision check.
