---
name: pre-commit
description: Guide for understanding, running, bypassing, or modifying the pre-commit hook. Use when the user asks what checks run before a commit, why a commit is failing, how to skip the hook, or how to add/remove a check.
---

# Pre-commit Hook

Every commit triggers a set of automated checks via **husky** + **lint-staged**. The steps are chained with `&&`, so if any one fails the commit is blocked until it's fixed. (Mirrors `browchar-api`'s hook so front and back enforce the same gate.)

## What runs on every commit

### 1. Lint + Format + paired-test check (on staged files only)

Handled by `lint-staged` (`lint-staged.config.mjs`) — only touches files you're committing, so it's fast.

- **ESLint** (`eslint --fix`) — enforces code quality rules, including `no-console` (not allowed in committed code) and the shared `@typescript-eslint/no-unused-vars` rule (names prefixed with `_` are ignored).
- **Paired-test gate** (`node scripts/check-test-pairs.mjs`) — any newly added file under `src/app`, `src/components`, or `src/lib` must ship with a sibling `*.test.ts(x)`, unless it's exempt (pure `*.types.ts`, barrels, or vendor `components/ui/*` primitives).
- **Prettier** (`prettier --write`) — auto-formats code, plus `json`/`css`/`md` and other config files.

### 2. Type check (full project)

```
npm run typecheck   # tsc --noEmit
```

Catches TypeScript type errors across the whole codebase, not just staged files.

### 3. Unit tests

```
npm run test:run -- --bail=1   # vitest run, stops on first failure
```

## If the commit is blocked

Read the error output — it tells you which check failed and why. Fix the issue, `git add` the changes, and commit again.

## If you need to skip the hook (emergencies only)

```bash
git commit --no-verify -m "your message"
```

Only for genuine emergencies (e.g. fixing broken CI). Never skip to avoid fixing real errors.

## Adding or removing checks

- **lint-staged rules** (which files, which commands): edit `lint-staged.config.mjs`.
- **Hook steps** (type check, tests): edit `.husky/pre-commit`.
- **ESLint rules** (what's enforced): edit `eslint.config.mjs`.
- **Paired-test exemptions**: edit `scripts/check-test-pairs.mjs`.
