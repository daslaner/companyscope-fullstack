# CI/CD and public showcase

The repository uses separate workflows so quality, supply-chain review, static analysis and publishing have clear permissions and failure modes.

## Quality gate

On pushes to `main` and pull requests, CI:

1. installs the Node release declared in `.nvmrc`;
2. restores the npm cache and performs a reproducible `npm ci` from the committed lockfile;
3. runs `npm run verify`;
4. runs `npm audit --omit=dev --audit-level=high`;
5. uploads coverage output even when a later step fails.

## Security automation

- Dependency Review blocks newly introduced high-severity dependencies on pull requests.
- CodeQL analyzes JavaScript/TypeScript on main, pull requests and a weekly schedule.
- Dependabot keeps npm packages and GitHub Actions visible for explicit review.
- Workflow permissions are scoped per workflow/job instead of granting write access globally.

## Storybook deployment

After the `CI` workflow succeeds for `main`, the Storybook workflow checks out that exact verified commit, rebuilds Storybook and publishes it through GitHub Pages using GitHub's artifact/deployment flow. Failed or superseded CI runs are never deployed. Enable **Settings → Pages → Source: GitHub Actions** once in the public repository.

The published Storybook showcases component states without exposing server credentials or requiring the local auth BFF.
