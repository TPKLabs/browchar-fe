---
name: add-app-route
description: Scaffold a new App Router page, layout, or route handler under src/app for this project's Next.js version. Use when asked to add a page, route, layout, or API route handler.
---

# Add an App Router page / layout / route

## 1. Read the docs shipped with this exact Next.js version first

Per `AGENTS.md`: **this is not the Next.js you know.** The installed version
(`node_modules/next/package.json`) may have breaking changes vs. your
training data — file conventions, `params`/`searchParams` shape, caching
defaults, etc. can differ.

Before writing anything, read the relevant page(s) under:

```
node_modules/next/dist/docs/01-app/
```

At minimum check `01-app/02-guides` (or `01-app/*getting-started*`) for the
file convention you're about to use (`page.tsx`, `layout.tsx`, `route.ts`,
`loading.tsx`, `error.tsx`), and the API reference for exact function
signatures (e.g. whether `params`/`searchParams` are plain objects or
Promises in this version — this has changed across Next major versions).
Do not assume the signature from memory.

## 2. Placement and naming

- Route segment = folder path under `src/app`, e.g. a `/characters/[id]`
  page goes in `src/app/characters/[id]/page.tsx`.
- Server Component by default. Only add `"use client"` at the top of the
  file if it needs hooks, event handlers, or browser-only APIs.
- Use the `@/*` path alias (`@/lib/...`, `@/components/...`) for anything
  outside the current route segment — never deep relative imports.
- If the route needs data types, pull them from `src/lib/types` — don't
  redefine shapes that already mirror the backend (`browchar-api`) there.

## 3. Testing

App Router pages/layouts are unit-testable with Vitest + React Testing
Library (see the project's `vitest.config.mts`). Add a paired
`page.test.tsx` (or `layout.test.tsx`) next to the file, following the
existing example at `src/app/page.test.tsx`. This is enforced for new files
under `src/app` by the pre-commit hook
(`scripts/check-test-pairs.mjs`) unless the file is a pure barrel/type file.

Note from the Next.js docs: `async` Server Components aren't supported by
Vitest's unit-testing model yet — if the route is an async Server Component
that fetches data, say so explicitly and rely on manual/E2E verification
instead of forcing a unit test that can't render it.

## 4. Before finishing

Run `npm run lint`, `npm run typecheck`, `npm run test:run`, and
`npm run format` — all four also gate the commit via Husky.
