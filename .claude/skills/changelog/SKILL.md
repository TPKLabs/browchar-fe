---
name: changelog
description: Guide for understanding, running, bypassing, or modifying the automatic CHANGELOG.md updater. Use when the user asks why CHANGELOG.md changed (or didn't), how to flag a known issue or a future consideration in a commit, or how to modify what gets logged.
---

# Changelog Automation

`CHANGELOG.md` in this repo does **not** log every commit. It only tracks three things, per release:

- **Fixed** — bugs that were actually resolved.
- **Known Issues** — bugs found but intentionally left unresolved, to be fixed later.
- **Future Considerations** — risks, conflicts, or follow-ups implied by a change made now.

Ordinary `feat`/`docs`/`refactor`/`chore`/etc. commits with no such implication are **not** logged — this file is a working list of things that need future attention, not a release log of everything shipped.

> This repo uses the same footer-driven model as `browchar-api`, so the criteria for what gets logged (and how) match across front and back.

## How entries are generated

Commit via `npm run commit -- -m "type(scope): subject" [-m "body / footers"]` instead of a bare `git commit -m`. This wraps `git commit`:

1. `scripts/commit.mjs` joins the `-m` flags into the full commit message (subject + body + footers), same as `git commit` itself would.
2. Before invoking `git commit` at all, it runs the message through `scripts/lib/changelog.mjs`'s `applyChangelogUpdates`, which:
   - **Pass 1 — clean up first.** Checks the message for `Resolves-known-issue: <snippet>` footers. For each one, it looks through the _existing_ `### Known Issues` entries in `CHANGELOG.md` for a bullet matching that snippet and removes it (dropping the `### Known Issues` heading too if that was the last one).
   - **Pass 2 — write new entries.**
     - **Subject line is `fix(...): ...`** → logs the description under `### Fixed`.
     - **Body/footer has a `Known-issue: <description>` line** → logs `<description>` under `### Known Issues`.
     - **Body/footer has a `Future-consideration: <description>` line** → logs `<description>` under `### Future Considerations`.
3. If anything changed, `CHANGELOG.md` is written and `git add`ed **before** `git commit` runs, so the update is already part of the index — no hook trickery needed, and no separate commit is created.
4. Only then does `scripts/commit.mjs` call the real `git commit -m "<message>"`, which triggers the normal pre-commit and commit-msg hooks (lint-staged, typecheck, tests, commitlint) exactly as if you'd run `git commit` directly.
5. A single commit can produce zero, one, or several effects (e.g. a `fix:` commit can resolve one known issue via `Resolves-known-issue:` _and_ log a fresh one via `Known-issue:` in the same commit).
6. Merge commits, `fixup!`/`squash!` commits are skipped entirely.
7. Duplicate entries (exact same line already present) are not re-added.

See the `commit-conventions` skill for the exact footer syntax and examples (`Known-issue:` / `Future-consideration:` / `Resolves-known-issue:`).

### Why not a commit-msg hook?

An earlier version of this automation ran from `.husky/commit-msg`. That doesn't work: git computes the tree for the commit being created _before_ the commit-msg hook runs, so a `git add` performed inside that hook only affects the _next_ commit, not the one in progress — it silently leaves `CHANGELOG.md` staged and dangling instead of landing in the same commit. The same is true of `prepare-commit-msg`. Only changes staged before `git commit` starts (or from a `pre-commit` hook, which runs before the tree is computed but also before the message exists) can land in the commit being made — hence the wrapper script.

### If you commit without the wrapper

Running a bare `git commit -m "..."` still works and still passes lint-staged/typecheck/tests/commitlint — it just skips the changelog automation (no entry gets logged, and nothing is left dangling). `.husky/commit-msg` runs `scripts/warn-changelog.mjs`, which checks whether the message _would_ have produced a changelog entry and, if `CHANGELOG.md` isn't already staged, prints a `[warn-changelog] ...` warning telling you to use `npm run commit` instead — it's advisory only and never blocks the commit (it runs before commitlint in the hook, specifically so it can't mask commitlint's exit code). If you see that warning and the commit should have logged something, add the `CHANGELOG.md` entry by hand, or amend: `npm run commit -- -m "$(git log -1 --pretty=%B)"` after `git reset --soft HEAD~1` re-runs the automation against the same message.

## Resolving vs. modifying a known issue

- **Fully resolved** → use the `Resolves-known-issue: <snippet>` footer. The snippet only needs to be a substring of the existing bullet (matched case-insensitively, in either direction), so a short phrase from the original entry is enough. No exact copy-paste required.
- **Partially resolved or reshaped** (the bug changed shape, or only part of it was fixed) → there's no automated footer for this. Edit the bullet directly in `CHANGELOG.md` as part of the same commit — the automation only ever _appends_ or _removes exact matches_, it never rewrites text for you, so a manual edit is the correct move here.
- If `Resolves-known-issue:` doesn't match any existing bullet (typo, or it was already removed), `scripts/commit.mjs` logs a `[commit] no "Known Issues" entry matched` warning and proceeds with the commit anyway — it does not block it.

## Linking to a PR

The generated `### Fixed` line has no PR link (the PR number isn't known at commit time). If you want the link, add it manually in a follow-up commit once the PR is open, e.g. `([#N](url))` — the same pattern used by earlier entries in this file.

## Failure behavior

The changelog update never blocks a commit. All errors are caught and logged as a warning by `scripts/commit.mjs`; a broken changelog update must never stop you from committing. Same for `scripts/warn-changelog.mjs`: it's advisory only and swallows its own errors.
