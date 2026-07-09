---
name: changelog
description: Add CHANGELOG.md entries for bug fixes and forward-looking "Known Issues" (deferred bugs, risky assumptions, TODOs with real consequences) as they're found. Use whenever creating a commit in this repo — not just when opening a PR — so nothing discovered mid-task gets silently lost.
---

# Changelog entries

This repo keeps a running `CHANGELOG.md` (Keep a Changelog format) under
`## [Unreleased]`. This skill governs what goes in it and when — for PR
title/body conventions see `pr-conventions`; for commit message wording see
`commit-conventions`.

## Before writing an entry

Read the existing `### Known Issues` entries first. If this commit resolves
one (fixes the bug, removes the risky assumption, finishes the deferred
work), remove that entry — or move it to `### Fixed` if it's now a
documented fix in its own right — rather than leaving a stale warning next
to the new entries. Do this even if the commit's main purpose is unrelated;
a `Known Issues` line that's no longer true is worse than no line at all.

## When to add an entry

Check this at every commit, not just when opening a PR — the trigger is
"did this commit produce one of the two things below," not "is this PR
titled `fix`."

### `### Fixed`

A bug was actually fixed in this commit. One line per fix, written for
someone who wasn't there: what was broken, why, and the observable effect —
not just "fixed bug in X." Link back to the PR (`([#N](url))`) once the PR
number is known; if committing before the PR exists, add the line without a
link and fill it in with a follow-up commit once the PR is opened (see the
`docs(changelog): document PR #4 fixes` commit in this repo's history for
the pattern).

### `### Known Issues`

A bug was found but not fixed now, or something about this commit carries
a real future risk: a workaround with a shelf life, an assumption that
could break, a TODO with actual consequences if ignored. One line per item,
and be specific about _why it matters_ and _what would need to happen_ to
resolve it. "There's a TODO in `buildHeaders`" is not an entry;
"`buildHeaders` has no `Authorization` hook yet (DEV-5 not started) — every
authenticated endpoint added before then will silently send unauthenticated
requests" is.

## When NOT to add an entry

- Plain `feat`/`chore`/`style`/`docs`/`refactor`/`test` work that carries no
  bug fix and no forward-looking risk. Most feature commits don't need an
  entry — only add one if the commit also fixed something or left a known
  gap worth flagging.
- Don't restate the PR body's Summary — the changelog is for fixes and
  risks specifically, not a log of every file touched.

## Format

Same as existing entries: one bullet per fix/issue, under `## [Unreleased]`,
using `### Fixed` / `### Known Issues` (create the subsection if it doesn't
exist yet, in that order, above any other `###` subsections).
