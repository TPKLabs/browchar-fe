---
name: review-standards
description: Review a diff against this project's specific conventions (aliases, domain types, paired tests, shadcn usage, Next.js version quirks) rather than generic code quality. Use for "review this against our standards" style requests; for a general correctness/security review use /code-review instead.
---

# Review against this project's standards

This is a project-specific supplement, not a replacement for `/code-review`.
Run this when you want the diff checked against conventions particular to
this repo's stack (Next.js 16 / React 19 / TS strict / Tailwind 4 / shadcn /
zod / react-hook-form / TanStack Query), which a generic reviewer won't know.

Check the diff against each item below. Report only what's actually
violated — don't restate items that already comply.

## Structure & imports

- Uses the `@/*` alias (`@/lib`, `@/components`, `@/components/ui`, `@/hooks`)
  instead of deep relative imports (`../../../lib/utils`).
- New `src/components/ui/*` files match `components.json` (`style`,
  `baseColor`, `iconLibrary`) rather than introducing a different pattern.

## Types & schemas

- Domain shapes come from `src/lib/types/*.types.ts`, not redefined inline.
  If a PR adds a new inline `interface`/`type` that duplicates or diverges
  from an existing one there, flag it.
- Any new Zod schema mirrors the corresponding `*Input` type from
  `src/lib/types` field-for-field (required/optional, nesting).
- `*.types.ts` files stay declaration-only (no runtime logic) — that's why
  they're exempt from the paired-test rule; a `.types.ts` file with actual
  logic in it is itself a finding.

## Tests

- Every new file under `src/app`, `src/components`, or `src/lib` has a
  sibling `*.test.ts(x)` (or `__tests__/*.test.ts(x)`), unless it's a type-only
  file, a barrel `index.ts`, or a vendor `components/ui/*` primitive used
  as-is. This is also enforced mechanically by
  `scripts/check-test-pairs.mjs` in the pre-commit hook — if you see a new
  file that should have failed that check, the hook may have been bypassed
  (`--no-verify`); call that out.
- Tests assert observable behavior (rendered output, called handlers), not
  internals.

## Next.js version quirks

- Anything touching `src/app` routing conventions, `params`/`searchParams`
  shape, or caching behavior should show evidence the author checked
  `node_modules/next/dist/docs/01-app/` rather than assuming standard
  Next.js behavior — per `AGENTS.md`, this version has breaking changes vs.
  typical training-data knowledge. If a PR uses an API in a way that looks
  like older/standard Next.js conventions, flag it for verification against
  the shipped docs.

## Formatting & commit hygiene

- Code is Prettier-formatted (`npm run format:check` should be clean) and
  lint-clean (`npm run lint`).
- Commit messages follow Conventional Commits (enforced by commitlint on
  `commit-msg`, but worth a glance on PR titles/squash messages too).
