# Decision log

## D-001 — Map + semantic alternative instead of map-only exploration

**Decision:** Keep geographic visualization supplementary and non-essential to interaction.

**Why:** A semantic list/table is faster for comparison, fully keyboard reachable, testable without map tiles and resilient when the third-party tile layer fails.

## D-002 — Explainable 0–100 risk signal

**Decision:** Always pair the numeric score with a named band; use the `riskExplainability` flag to roll out the deeper methodology/context panel.

**Trade-off:** The baseline never loses human-readable semantics, while the larger explanatory surface can still be tested and rolled out independently.

## D-003 — Anonymous inspection + local-first saves

**Decision:** Let anonymous users inspect synthetic company detail pages and save IDs locally; require authentication for the research workspace.

**Why:** This reduces activation friction while keeping server-side workspace/session authorization explicit. In production, local saved IDs would migrate into durable account storage after registration/login.

## D-004 — Distinguish anonymous auth from unavailable auth

**Decision:** Treat only a confirmed 401 as anonymous. Network and 5xx errors produce a retryable closed state.

**Why:** Redirecting on infrastructure failure makes a secure application lie about session state and can turn a failed logout into a false success signal.

## D-005 — Vendor-neutral analytics port

**Decision:** Components emit typed product events through `AnalyticsPort`, not directly to a third-party SDK.

**Why:** Keeps the domain measurable while minimizing lock-in and making privacy review/testing straightforward.

## D-006 — Bounded explainer instead of chat surface

**Decision:** Expose four typed explanation modes and never accept arbitrary prompts from the browser.

**Why:** Keeps the feature aligned with the research job, simplifies evaluation, limits misuse and makes the trust boundary explainable. The authenticated BFF additionally requires CSRF + trusted Origin and builds model context from trusted structured fields.

## D-007 — In-memory adapters for the portfolio BFF

**Decision:** Implement real password hashing/session/CSRF mechanics but keep user/session persistence in memory.

**Why:** Demonstrates the fullstack security boundary without introducing a hosted database requirement for reviewers. The limitation is explicit; production deployment would swap these adapters for durable/shared infrastructure.
