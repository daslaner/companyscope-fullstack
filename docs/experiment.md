# Experiment: saved research views
**Hypothesis:** If repeat researchers can save a filtered view, 7-day return-to-research rate will increase because users avoid reconstructing frequent queries.

**Primary metric:** share of activated workspaces returning to a saved view within 7 days.
**Guardrails:** no regression in search completion time, accessibility defects or client errors.
**Rollout:** internal → 10% → 50% → 100%, gated by the `savedViews` flag.
**Stop condition:** material error/accessibility regression or no directional improvement after the pre-agreed sample window.
