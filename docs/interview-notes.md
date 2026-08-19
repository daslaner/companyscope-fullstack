# Interview discussion prompts

Use the repository to discuss concrete trade-offs rather than just the stack:

- why Leaflet is supplementary and semantic HTML is the authoritative interaction path;
- why only a confirmed 401 becomes an anonymous auth state;
- why a failed logout is not treated as success;
- why the portfolio BFF implements real session/CSRF/password mechanics but keeps persistence behind in-memory adapters;
- why anonymous saved IDs are local-first and what a post-login migration would look like;
- where TanStack Query adds value for server state and where local deterministic data deliberately does not use it;
- how typed analytics keep product measurement vendor-neutral and privacy-minimal;
- how feature flags gate real surfaces (saved research, risk methodology, compare and Explainer);
- why the Explainer accepts an allow-listed intent rather than arbitrary prompts;
- which guardrail (security, accessibility, unsupported-claim rate, latency or cost) could block a release even if conversion improves.

A strong walkthrough should separate **implemented reference mechanics** from **production scale concerns** such as durable databases, distributed sessions/rate limits, observability and secret infrastructure.
