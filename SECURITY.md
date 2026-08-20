# Security policy

Report vulnerabilities privately to the repository owner.

## Implemented application controls

- **Opaque server sessions:** the BFF sets an HttpOnly, SameSite=Lax session cookie. `Secure` is the production default. Browser JavaScript never receives the session identifier.
- **Session-bound CSRF:** authentication establishes a separate CSRF value, and `/api/me` rehydrates it for refreshed/new tabs. Logout and the cost-incurring Explainer require a matching CSRF header plus the exact trusted Origin.
- **Password storage:** registration passwords are validated at the shared boundary and hashed with salted Node `scrypt`; plaintext passwords are not stored.
- **Authorization boundary:** `/api/me` and `/api/explain` require a valid server session. The browser does not decide whether a protected request is authorized.
- **Model isolation:** `OPENAI_API_KEY` is read only by the BFF. Explainer input is strict and allow-listed (`companyId` + `focus`) and never relays arbitrary browser prompts.
- **Abuse controls:** auth and Explainer routes use separate rate-limit budgets and explicit body-size limits. In-memory limiter state is bounded and expired entries are swept.
- **Browser/API hardening:** exact Origin/CORS policy, credentialed CORS only for the trusted origin, JSON-only state-changing requests, no-store API responses, CSP, clickjacking, MIME-sniffing, referrer and permissions policies; HSTS is emitted in production mode.
- **Static runtime hardening:** production SPA serving prevents path traversal, separates unknown `/api/*` routes from SPA fallback, uses immutable caching only for fingerprinted assets, and preserves restrictive document headers.
- **Frontend safety:** React escaping, bounded data schemas and no bearer/session token storage in localStorage/sessionStorage. The only browser auth value is the non-secret CSRF token.

## Deliberate portfolio boundary

The BFF uses in-memory user/session repositories so the demo is dependency-light and reproducible. That is **not** presented as production persistence. A multi-instance production service should provide durable user storage, a shared/rotated session store, distributed rate limiting, centralized audit/observability and managed secrets behind the existing interfaces/boundaries.

The optional `VITE_REMOTE_AUTH=false` mode is a frontend showcase adapter only. It stores a boolean demo-session marker and synthetic user metadata in sessionStorage, not credentials or bearer tokens. The committed production Vite environment enables same-origin remote BFF auth.

## Supply-chain and CI controls

- CI is split into lint, strict typecheck, 90% coverage, build, production dependency audit, browser E2E and tested-container stages with a stable aggregate Quality Gate.
- Playwright executes critical flows against the actual production bundle.
- CodeQL scans JavaScript/TypeScript on `master`, pull requests and weekly using security-and-quality queries.
- Dependency Review can block newly introduced high-severity dependencies once GitHub's Dependency Graph is enabled.
- Dependabot tracks npm and GitHub Actions updates.
- Third-party GitHub Actions are pinned to full immutable commit SHAs; readable comments retain the intended release version.
- Workflow permissions are least-privilege and source checkout does not persist credentials.
- Storybook and fullstack release workflows consume artifacts from the successful CI run rather than executing untrusted PR code with deployment permissions.
- Production uses an immutable container SHA, protected Environment configuration and exact-revision health verification. Manual rollback also targets immutable previously published SHAs.

Repository-level governance such as required status checks and protected Environments is documented in `docs/github-repository-settings.md` because it cannot be enforced by repository YAML alone.
