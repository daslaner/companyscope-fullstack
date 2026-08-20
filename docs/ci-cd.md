# CI/CD and public showcase

The repository uses separate workflows so quality, supply-chain review, static analysis and publishing have clear permissions and failure modes.

## Quality gate

On pushes to `master` and pull requests, CI:

1. installs the Node release declared in `.nvmrc`;
2. restores the npm cache and performs a reproducible `npm ci` from the committed lockfile;
3. runs `npm run verify`;
4. runs `npm audit --omit=dev --audit-level=high`;
5. uploads coverage output even when a later step fails.

## Security automation

- Dependency Review blocks newly introduced high-severity dependencies on pull requests.
- CodeQL analyzes JavaScript/TypeScript on master, pull requests and a weekly schedule.
- Dependabot keeps npm packages and GitHub Actions visible for explicit review.
- Workflow permissions are scoped per workflow/job instead of granting write access globally.

## Storybook deployment

After the `CI` workflow succeeds for `master`, the Storybook workflow checks out that exact verified commit, rebuilds Storybook and publishes it through GitHub Pages using GitHub's artifact/deployment flow. Failed or superseded CI runs are never deployed. Enable **Settings → Pages → Source: GitHub Actions** once in the public repository.

The published Storybook showcases component states without exposing server credentials or requiring the local auth BFF.

## Dependency Review repository prerequisite

The dependency review workflow is intentionally opt-in because GitHub's Dependency Review API requires the repository Dependency Graph. The ordinary CI gate does not depend on this repository-level feature; `npm run audit:prod` and Dependabot continue to provide dependency checks.

To enable PR dependency review:

1. In GitHub, open **Settings → Security & analysis** and enable **Dependency graph**.
2. Open **Settings → Secrets and variables → Actions → Variables**.
3. Create the repository variable `ENABLE_DEPENDENCY_REVIEW` with value `true`.

Until both are configured, the Dependency Review job is skipped rather than failing unrelated CI runs.
