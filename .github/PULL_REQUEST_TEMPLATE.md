<!--
Title (see the `pr-conventions` skill for full detail):
- Ticket-driven work: `<TICKET> <ticket name> — type(scope): summary`
  e.g. "DEV-155 Navbar shell — feat(nav): add navbar shell to root layout"
- Non-ticket work (chores/tooling): plain Conventional Commits, e.g.
  "chore(tooling): add pre-commit pipeline, Vitest setup, and project skills"
- Imperative mood, no trailing period. Summarizes the whole PR, not just the last commit.

Base branch is always `main`. One branch per concern — split unrelated changes
into separate PRs rather than growing this one.
-->

## Summary

-

## Test plan

- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run test:run
- [ ] npm run format:check

<!-- Add manual verification steps here if the change touches tooling, hooks,
or anything the automated tests don't exercise. -->
