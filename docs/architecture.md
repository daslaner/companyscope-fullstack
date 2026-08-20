# Architecture

CompanyScope is split into explicit layers:

1. **Presentation** — a single application shell owns global navigation/skip-link behavior; route pages own page content, semantic HTML, chart summaries and the supplementary visual map.
2. **Product/application** — typed analytics events, feature flags, saved-research workflow and auth state.
3. **Client infrastructure** — TanStack Query, the credentialed API adapter and route-level lazy loading.
4. **BFF/trust boundary** — Node HTTP endpoints for auth/session lifecycle and the bounded model request.
5. **Production runtime** — the same BFF can serve the compiled SPA with guarded path resolution, SPA fallback, cache rules and browser security headers.

Shared authentication schemas live in `src/shared/auth.ts` so client validation and server validation agree while the server remains authoritative.

## Server state

`AuthProvider` uses TanStack Query for `/api/me` and mutations for login, registration and logout. A 401 becomes an explicit anonymous state; network/5xx failures become a retryable infrastructure state and are never silently treated as logout. A failed logout leaves the authenticated UI in place until the server confirms the session ended.

## Authentication boundary

The BFF issues an opaque HttpOnly cookie and returns a separate session-bound CSRF value on authentication and `/api/me`. Client code stores only the CSRF value in sessionStorage, so a refreshed or newly opened tab can rehydrate mutation protection without exposing the session credential. Protected/cost-incurring mutations require both a trusted Origin and matching CSRF token. Passwords are hashed with `scrypt` before the in-memory user repository stores them.

The repositories are intentionally in-memory for portfolio reproducibility. Production persistence and distributed session/rate-limit implementations can replace that boundary without changing the browser contract.

## Production runtime

`npm run build:production` emits two deployable outputs:

- `dist/` — Vite browser assets built for same-origin BFF auth/API access;
- `server-dist/server.mjs` — an esbuild-bundled Node server.

With `SERVE_STATIC=true`, the Node service owns both browser and API traffic. Static path resolution is contained to the configured root, fingerprinted `/assets/*` responses are immutable-cacheable, documents remain revalidation-safe, unknown API routes stay JSON 404s, and non-file browser routes fall back to `index.html` for React Router.

The runtime image contains only those built artifacts on top of pinned Node 24.18.0, runs as the non-root `node` user, exposes a health endpoint, and handles SIGTERM/SIGINT for graceful shutdown. `NODE_ENV=production` requires an explicit `APP_ORIGIN` and defaults session cookies to `Secure`.

## Product state

Saved companies are deliberately local-first for anonymous/public detail browsing. They become a visible shortlist in the authenticated workspace. This avoids pretending localStorage is server persistence while still demonstrating the activation path; a production implementation would migrate local IDs to the account after authentication.

Typed analytics events are emitted at decision points rather than coupled to a vendor SDK. Feature flags gate actual product paths including Saved Companies, risk-band explainability, portfolio comparison and the Explainer.

## Accessibility

The Leaflet canvas/DOM is supplementary visual output, not the only interaction path. It is non-interactive/hidden from assistive technology and paired with a semantic list on the public home route or the full company table in the workspace. Recharts figures expose titles, descriptions and equivalent text summaries.

## Performance

Top-level pages are loaded with `React.lazy`/`Suspense`, separating dashboard/detail-heavy modules from unrelated route chunks. TanStack Query caches server state, while deterministic local company data avoids network waterfalls in the portfolio demo.

## Delivery boundary

CI builds browser/BFF/Storybook artifacts once. E2E and container smoke tests consume those outputs rather than rebuilding them. The tested container is promoted to an immutable GHCR commit tag; optional production deployment consumes that same tag and confirms the exact running revision through `/api/health`.
