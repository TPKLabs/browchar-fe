---
name: first-setup
description: Step-by-step guide to set up the frontend from scratch for the first time. Use when the user asks how to set up the project, run it for the first time, clone and run, or onboard a new dev.
---

# First Setup

Follow these steps in order. Each step must succeed before moving to the next.

## Prerequisites

- Node.js 20+
- npm
- The `browchar-api` backend running locally (default: `http://localhost:3000`), so the app has an API to talk to. See the API repo's `first-setup` skill.

---

## 1. Install dependencies

```bash
npm install
```

This also wires up husky's git hooks (via the `prepare` script) so pre-commit and commit-msg run locally.

---

## 2. Configure the environment

Create `.env.local` and point the app at the local API:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

---

## 3. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:3000` by Next.js default — if the API already uses that port, start the frontend on another (`npm run dev -- -p 3001`).

---

## Verify everything works

```bash
npm run lint
npm run typecheck
npm run test:run
```

---

## Pre-commit hooks

After `npm install`, husky sets up git hooks automatically. On every commit (see the `pre-commit` skill):

1. **lint-staged** runs ESLint (`--fix`), the paired-test check, and Prettier (`--write`) on staged files — **this modifies your files in place**. Review the diff after a failed commit if files changed unexpectedly.
2. TypeScript type-check (`tsc --noEmit`)
3. Unit tests (`vitest run --bail=1`)

The commit-msg hook validates the message with commitlint. Commit via `npm run commit -- -m "..."` (instead of a bare `git commit -m`) to also get `CHANGELOG.md` updated automatically — see the `commit-conventions` and `changelog` skills.

> In CI environments (`CI=true`), husky is skipped automatically — hooks only run locally.

---

## Troubleshooting

| Problem                               | Fix                                                                                                |
| ------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Requests fail / CORS errors           | Check the API is running and `NEXT_PUBLIC_API_URL` matches its URL                                 |
| Port already in use                   | Start on another port: `npm run dev -- -p 3001`                                                    |
| Commit rejected by commitlint         | Message must follow Conventional Commits — see the `commit-conventions` skill                      |
| Commit rejected: "Falta un spec/test" | Add the sibling `*.test.tsx` for the new file, or mark it exempt in `scripts/check-test-pairs.mjs` |
