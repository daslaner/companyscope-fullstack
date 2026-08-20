# CI/CD architecture

CompanyScope separates verification, security analysis, artifact creation and deployment so each stage has a narrow responsibility and permission set.

## Pull-request and master quality gate

`CI` runs on pull requests targeting `master` and pushes to `master`. Independent work is parallelized into named jobs:

1. **Lint** — ESLint with zero warnings.
2. **Typecheck** — strict browser, BFF/tools and Playwright TypeScript projects.
3. **Unit + coverage** — Vitest with 90% minimum lines/statements/functions/branches.
4. **Build immutable artifacts** — one Vite browser build, one bundled Node BFF, and one Storybook build.
5. **Production dependency audit** — high-severity production dependency gate.
6. **E2E / Chromium** — Playwright runs critical journeys against the exact production bundle produced by the build job.
7. **Container smoke test** — packages that same verified bundle into the runtime image, checks health and an SPA deep link, then exports the tested image.
8. **Quality Gate** — stable aggregate status that fails unless every required CI job succeeded.

Every install uses the committed lockfile through `npm ci` and the Node version in `.nvmrc`. `setup-node` caches npm's download cache; `node_modules` itself is not shared between jobs.

For branch protection, require the stable **`CI / Quality Gate`** status rather than coupling repository rules to every internal job name.

## Build once, promote the same artifact

CI does not rebuild deployable content in downstream release workflows:

```text
source commit
    ↓
parallel verification
    ↓
production-bundle-<sha>
    ├── dist/
    └── server-dist/
    ↓
Playwright against that bundle
    ↓
container smoke test
    ↓
container-image-<sha>
    ↓
successful Quality Gate
    ↓
GHCR immutable tag <sha>
    ↓
optional protected production deployment
```

Storybook follows the same principle: CI builds `storybook-<sha>` once, and GitHub Pages downloads that exact artifact from the successful CI run instead of rebuilding it.

## Fullstack runtime delivery

The production Node BFF can serve both `/api/*` and the built SPA. CI builds a minimal runtime image from only `dist/` and the bundled `server.mjs`, runs it as a non-root user and health-checks it before exporting the image.

After a successful push CI run on `master`, **Fullstack Release** loads that exact tested image and publishes:

- `ghcr.io/<owner>/<repo>:<full-commit-sha>` — immutable deployment identity;
- `:master` — moving branch channel;
- `:latest` — convenience channel.

Production deployment is intentionally disabled until infrastructure is configured. When `ENABLE_PRODUCTION_DEPLOY=true`, the release job enters the protected `production` environment and sends the immutable image reference to `PRODUCTION_DEPLOY_WEBHOOK`. The health check must then report both `status=ok` and the exact expected commit SHA.

`Production Rollback` is a manual, protected workflow that accepts a previously published 40-character SHA and deploys that immutable image through the same adapter. This keeps rollback explicit and auditable without binding the portfolio repository to one cloud provider.

## Security automation

- **CodeQL** analyzes JavaScript/TypeScript on PRs, `master`, and weekly using the `security-and-quality` query suite.
- **Dependency Review** blocks newly introduced high-severity dependencies when the repository Dependency Graph is enabled.
- **Dependabot** groups routine npm and GitHub Actions updates for review.
- `npm audit --omit=dev --audit-level=high` gates the production dependency graph.
- Third-party GitHub Actions are pinned to full 40-character commit SHAs, with readable release comments.
- Workflow permissions default to read-only and write scopes exist only on deployment/security jobs that require them.
- `persist-credentials: false` is used on source checkouts.
- Concurrency cancels superseded CI runs while production deployment/rollback deliberately never cancels an in-flight release.

## Repository configuration

YAML alone cannot enforce branch and environment governance. Apply the repository settings in [`github-repository-settings.md`](./github-repository-settings.md) after pushing the repository.
