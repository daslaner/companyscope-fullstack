# GitHub repository settings runbook

These settings complete the controls that cannot be committed as source code.

## 1. Protect `master`

Create a branch ruleset for `master` under **Settings → Rules → Rulesets** (or equivalent branch protection UI):

- require a pull request before merge;
- require approvals when the repository has another reviewer available;
- require conversation resolution;
- require branches to be up to date before merge;
- require status checks:
  - **CI / Quality Gate**;
  - **CodeQL / Analyze JavaScript / TypeScript**;
  - optionally **Dependency Review / Review dependency changes** after Dependency Review is enabled;
- block force pushes;
- block branch deletion;
- prefer linear history for a clean portfolio log.

For a solo portfolio repository, do not configure an approval rule that makes it impossible for the only maintainer to merge. The quality/status requirements should still remain mandatory.

## 2. Enable supply-chain visibility

Under **Settings → Security / Code security and analysis**:

1. enable **Dependency graph**;
2. enable Dependabot alerts/security updates if available for the repository;
3. under **Settings → Secrets and variables → Actions → Variables**, add:

```text
ENABLE_DEPENDENCY_REVIEW=true
```

This is a **repository variable**, not an Environment variable.

## 3. GitHub Pages environment

Set **Settings → Pages → Source** to **GitHub Actions**.

For the `github-pages` Environment:

- limit deployment branches to `master`;
- keep deployment through the committed Storybook workflow only.

Storybook is deployed from the artifact produced by the successful CI run; it is not rebuilt in the privileged Pages workflow.

## 4. GitHub Container Registry

The `Fullstack Release` workflow publishes the tested runtime image to GHCR after successful `master` CI. Keep package write permissions limited to that release workflow. Public package visibility can be enabled if the container is part of the portfolio showcase.

## 5. Optional production Environment

Create an Environment named `production` and restrict it to `master`. When a real hosting target exists, configure:

Repository variable:

```text
ENABLE_PRODUCTION_DEPLOY=true
```

Environment variables:

```text
PRODUCTION_URL=https://your-app.example
PRODUCTION_HEALTH_URL=https://your-app.example/api/health
```

Environment secret:

```text
PRODUCTION_DEPLOY_WEBHOOK=<provider-specific authenticated deployment endpoint>
```

Where the GitHub plan supports it, add a required reviewer to the `production` Environment. Keep `ENABLE_PRODUCTION_DEPLOY` unset/false until the target exists; image publication to GHCR remains automatic and useful without it.

The deployment adapter sends JSON containing the exact immutable GHCR image and commit SHA. Production is considered successful only when the health endpoint reports the same commit.

## 6. Rollback drill

Periodically verify the manual **Production Rollback** workflow with a previously published healthy SHA. A rollback path that has never been exercised should not be treated as a reliable recovery mechanism.
