# Architecture

CompanyScope is split into four explicit layers:

1. **Presentation** — a single application shell owns global navigation/skip-link behavior; route pages own only page content, semantic HTML, chart summaries and the visual map.
2. **Product/application** — typed analytics events, feature flags, saved-research workflow and auth state.
3. **Client infrastructure** — TanStack Query, the credentialed API adapter and route-level lazy loading.
4. **BFF/trust boundary** — Node HTTP endpoints for auth/session lifecycle and the bounded model request.

Shared authentication schemas live in `src/shared/auth.ts` so client validation and server validation agree while the server remains authoritative.

## Server state

`AuthProvider` uses TanStack Query for `/api/me` and mutations for login, registration and logout. A 401 becomes an explicit anonymous state; network/5xx failures become a retryable infrastructure state and are never silently treated as logout. A failed logout leaves the authenticated UI in place until the server confirms the session ended.

## Authentication boundary

The BFF issues an opaque HttpOnly cookie and returns a separate session-bound CSRF value on authentication and `/api/me`. Client code stores only the CSRF value in sessionStorage, so a refreshed or newly opened tab can rehydrate mutation protection without exposing the session credential. Protected/cost-incurring mutations require both a trusted Origin and matching CSRF token. Passwords are hashed with `scrypt` before the in-memory user repository stores them.

The repositories are intentionally in-memory for portfolio reproducibility. Production persistence and distributed session/rate-limit implementations can replace that boundary without changing the browser contract.

## Product state

Saved companies are deliberately local-first for anonymous/public detail browsing. They become a visible shortlist in the authenticated workspace. This avoids pretending localStorage is server persistence while still demonstrating the activation path; a production implementation would migrate local IDs to the account after authentication.

Typed analytics events are emitted at decision points rather than coupled to a vendor SDK. Feature flags actually gate Saved Companies, risk-band explainability and the Explainer route.

## Accessibility

The Leaflet canvas/DOM is treated as supplementary visual output, not the only interaction path. It is non-interactive/hidden from assistive technology and paired with a semantic list on the public home route or the full company table in the workspace. Recharts figures expose titles, descriptions and equivalent text summaries.

## Performance

Top-level pages are loaded with `React.lazy`/`Suspense`, separating dashboard/detail-heavy modules from unrelated routes. TanStack Query caches server state, while deterministic local company data avoids network waterfalls in the portfolio demo.
