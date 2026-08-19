# PRD: Company research workspace

## Problem
Commercial and strategy teams need a quick, trustworthy view of a company before outreach, diligence or market analysis. Today they often reconcile scattered sources manually, which increases time-to-insight and makes confidence hard to judge.

## Primary user
A research-heavy B2B user who evaluates multiple companies each week and needs comparable fundamentals, location context and trust signals.

## Job to be done
When I assess a company, help me find the important facts and confidence signals in one place so I can decide what to investigate next without reconstructing context manually.

## MVP scope
Search/filter; company fundamentals; global map; risk and verification signals; account registration/sign-in; secure session boundary; accessible list/table equivalent.

## Non-goals
CRM replacement, automated outreach, billing, exhaustive financial modeling and opaque scoring.

## Acceptance criteria
- A user can find a company by name, country or industry in under three interactions.
- Every map insight has a keyboard-accessible text equivalent.
- Risk values have human-readable semantics and never appear without context.
- Registration rejects malformed input; production auth uses server-issued secure sessions.
- Empty, loading, error and no-result states are explicit.

## 2026 expansion: decision-ready company profiles

The current slice expands the research loop from a summary table into seven deep-linkable evidence categories plus a bounded Explainer. The Explainer is optional: structured fields remain the source of truth and the experience must degrade cleanly when the model service is unavailable.

Acceptance criteria include 100 local records, direct-linkable tabs, keyboard-visible focus states, light/dark themes, saved-company state, no browser API secret, and an explainer request schema that cannot relay arbitrary prompts.
