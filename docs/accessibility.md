# Accessibility

CompanyScope targets WCAG 2.2 AA interaction patterns for the portfolio surface.

## Implemented patterns

- semantic headings, landmarks, labels, tables and definition lists
- visible keyboard focus through shared UI primitives
- skip links on content-heavy routes
- live/status messaging for result counts and asynchronous route/auth states
- chart figures with programmatic title, description and non-visual text summaries
- risk/status information expressed in text rather than color alone
- theme control with an explicit accessible name

## Map decision

Leaflet is treated as a supplementary visualization. The map container is intentionally hidden from assistive technology and configured without keyboard/pointer interaction for decision-making. The public page renders an equivalent semantic company list; the authenticated workspace points to the full searchable company table immediately below the map section.

This avoids claiming that Leaflet markers/popups are fully keyboard accessible when they are not the authoritative interaction path.

## Verification

Testing Library covers key semantic contracts and Storybook uses `@storybook/addon-a11y`. Accessibility-specific tests are included in the broader coverage run and can also be executed with `npm run test:a11y` during focused work.
