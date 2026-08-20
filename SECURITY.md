# Security policy

Report vulnerabilities privately to the repository owner.

## Implemented in this repository

- **Opaque server sessions:** the local BFF sets an HttpOnly, SameSite=Lax session cookie. `Secure` is added in production mode. Browser JavaScript never receives the session identifier.
- **Session-bound CSRF:** login/registration establish a separate CSRF value for the browser, and an authenticated `/api/me` response rehydrates it for refreshed/new tabs. Logout and the cost-incurring Explainer require a matching CSRF header plus the exact trusted Origin.
- **Password storage:** registration passwords are normalized/validated at the shared boundary and hashed with salted Node `scrypt`; plaintext passwords are not stored.
- **Authorization boundary:** `/api/me` and `/api/explain` require a valid server session. The browser does not decide whether a protected request is authorized.
- **Model isolation:** `OPENAI_API_KEY` is read only by the BFF. Explainer input is strict and allow-listed (`companyId` + `focus`) and never relays arbitrary browser prompts.
- **Abuse controls:** auth and Explainer routes use separate rate-limit budgets and explicit body-size limits. In-memory limiter state is bounded and expired entries are swept.
- **Browser/API hardening:** exact CORS origin, credentialed CORS only for the trusted origin, JSON-only state-changing requests, no-store responses, CSP, clickjacking, MIME-sniffing, referrer and permissions policies; HSTS is emitted in production mode.
- **Frontend safety:** React escaping, bounded data schemas and no bearer/session token storage in localStorage/sessionStorage. The only browser auth value is the non-secret CSRF token.

## Deliberate portfolio boundary

The BFF uses in-memory user/session repositories so the demo is dependency-light and reproducible. That is **not** presented as production persistence. A deployed multi-instance service should provide durable user storage, a shared/rotated session store, distributed rate limiting, audit/observability controls and secret management behind the existing interfaces/boundaries.

The optional `VITE_REMOTE_AUTH=false` mode is a frontend showcase adapter only. It stores a boolean demo session marker and synthetic user metadata in sessionStorage, not credentials or tokens.

## Supply-chain and CI controls

- Pull requests run high-severity Dependency Review.
- CodeQL scans JavaScript/TypeScript on master, pull requests and weekly.
- CI runs `npm audit --omit=dev --audit-level=high` after the reproducible install and quality gate.
- Dependabot tracks npm and GitHub Actions updates.
- Workflows use scoped permissions; Storybook deployment is isolated to GitHub Pages permissions.
