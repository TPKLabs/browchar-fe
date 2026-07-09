---
name: pr-conventions
description: This project's conventions for branch names, PR titles, and PR body structure. Use when opening a new pull request, retitling/rewording an existing one, or checking whether a PR follows the repo's standards.
---

# PR conventions

These are this repo's conventions for how a pull request is named,
structured, and scoped. This is about the PR itself (branch, title, body,
base) — for reviewing the _code_ in a diff against project standards, use
the `review-standards` skill; for commit message wording, use the
`commit-conventions` skill.

## Branch naming

- Ticket-driven work: `<TICKET>/<kebab-summary>`, e.g. `DEV-20/domain-types`.
  The ticket ID is the source of truth for context — don't duplicate it
  elsewhere in the branch name.
- Non-ticket work (tooling, chores with no ticket): `<type>/<kebab-summary>`,
  e.g. `chore/tooling-setup`, using the same `type` prefixes as Conventional
  Commits (`chore`, `fix`, `feat`, ...).

## PR title

- Conventional Commits format: `type(scope): summary`, imperative mood,
  no trailing period — matches the primary commit's subject line
  (`feat(types): add frontend domain types`, `chore(tooling): pre-commit
pipeline, Vitest setup, and project skills`).
- If a branch has multiple commits, the title summarizes the PR as a whole,
  not just the last commit.

## PR body

Two sections, in this order:

### `## Summary`

Bullet points, one change per bullet, written for a reviewer who hasn't
seen the branch — state what changed and, where it's not obvious from the
diff, why (e.g. "types `template` as `TemplateSection[]` instead of `Json`
because that's the real runtime shape needed to render the dynamic character
form"). Don't restate the diff line-by-line; summarize at the level of a
changelog entry.

### `## Test plan`

A checklist of what was actually verified before opening the PR, checked
(`[x]`) only for things actually run — never pre-check as aspirational.
Always include the relevant subset of:

```
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run test:run
- [ ] npm run format:check
```

Add manual verification steps (e.g. "verified pre-commit hook end-to-end
via a real commit") when the change touches tooling, hooks, or anything
`npm test` doesn't exercise.

## Changelog

Any PR whose title type is `fix` (see PR title above) must add an entry to
`CHANGELOG.md` under `## [Unreleased]` / `### Fixed`, one line per fix,
linking back to the PR. This is in addition to the PR body's Summary, not
instead of it — the PR body is for reviewers at review time; the changelog
is the durable record once it's merged. Don't add changelog entries for
`feat`/`chore`/`style`/etc. PRs unless they also happen to fix a bug.

## Base branch and scope

- Base is always `main` — this repo doesn't stack PRs.
- One branch per concern. If a branch accumulates unrelated changes (e.g. a
  types PR that also touches UI components), split it rather than growing
  the PR's Summary to cover two stories.

## Before opening

Run the Test plan checklist for real, then open with the review-standards
skill in mind — a PR that will fail that review on obvious points (missing
paired tests, inline types duplicating `src/lib/types`, deep relative
imports) is worth fixing before requesting review rather than after.
