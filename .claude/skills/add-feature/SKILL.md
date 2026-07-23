---
name: add-feature
description: Wire an existing domain type from src/types into a full feature -- zod schema, react-hook-form, and a TanStack Query hook. Use when asked to build a form, mutation, or data-fetching feature for a domain entity (Character, Playbook, etc.).
---

# Add a feature for an existing domain type

This project's domain types in `src/types/*.types.ts` are a deliberate
mirror of `browchar-api`'s Prisma models and Zod request schemas (see the
header comment in `src/types/index.ts`). Don't invent fields — the type
file is the contract.

## 1. Start from the type, not from the form

Find the relevant type and its `*Input` counterpart (e.g. `Character` +
`CreateCharacterInput` in `character.types.ts`). Read the JSDoc comments on
the type closely — they often note which backend schema/messages it mirrors
and any serialization quirks (e.g. dates arrive as ISO strings, not `Date`).

## 2. Zod schema

Write a Zod schema that matches the `*Input` type field-by-field — same
required/optional-ness, same shape for nested objects. If the type's JSDoc
references a specific backend schema (e.g. `createCharacterSchema`), mirror
its validation messages as closely as you can infer them; if you can't infer
the exact message wording from the comments, say so explicitly instead of
guessing, since the project convention is that front and back show matching
messages.

Put the schema in `src/schemas/` (not inside `src/types`, which is kept as
pure mirrored type declarations with no runtime logic — that's also why
`*.types.ts` files are exempt from the paired-test rule).

## 3. Form with react-hook-form + zod

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
```

Use `zodResolver(schema)` so validation is driven by the schema from step 2,
not duplicated in the form.

## 4. TanStack Query hook

Wrap the request in a `useMutation` (for create/update) or `useQuery` (for
reads) hook, in `src/hooks/` (e.g. `src/hooks/useCreateCharacter.ts`). Keep
query keys consistent (e.g. `["characters", characterId]`). Don't call
`fetch` directly from components — funnel it through the hook so
caching/invalidation stays centralized.

## 5. Tests

Add tests for:

- The Zod schema: at least one valid input and one invalid input per
  constraint you added.
- The hook or the form component's observable behavior (renders errors,
  calls the mutation with the right payload) — not implementation details.

This matches the pre-commit paired-test rule: any new file under `src/app`,
`src/components`, `src/hooks`, `src/types`, `src/api`, `src/schemas`,
`src/mocks`, or `src/utils` needs a sibling `*.test.ts(x)` unless it's exempt
(pure types, barrels, shadcn `components/ui` vendor files).

### Network tests use MSW, never a manual `fetch` stub

Any hook or container test that hits the network goes through MSW
(`src/mocks/server.ts`), not `vi.stubGlobal("fetch", ...)` — that pattern is
retired (DEV-200). Register the response for that test with `server.use(...)`
before rendering; it auto-resets after the test (`vitest.setup.ts`).

```ts
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";

it("hace POST /characters con el input", async () => {
  let receivedBody: unknown;
  server.use(
    http.post("/characters", async ({ request }) => {
      receivedBody = await request.json();
      return HttpResponse.json({ id: "char-1", name: "Aria" }, { status: 201 });
    }),
  );

  // render + act …

  expect(receivedBody).toEqual(INPUT);
});
```

Capture what you need to assert (method is implicit in `http.get`/`.post`/
`.patch`/`.delete`; read `request.url`/`request.json()` inside the resolver
for query params or body) into a local variable, then assert on it after
`await waitFor(...)` — don't try to inspect a mock's call args, there's no
`fetchMock` anymore.

If the feature hits an endpoint that doesn't have a handler yet, add one to
`src/mocks/handlers/<domain>.ts` (grouped by resource, aggregated in
`src/mocks/handlers/index.ts`) with an inert default (404/501 — force every
test to configure its own scenario rather than silently passing against an
accidental happy path). `src/mocks/**` is test infrastructure: it's exempt
from the coverage gate (DEV-37) and doesn't need its own paired test — it's
exercised indirectly by every test that calls `server.use(...)`.

## 6. Before finishing

Run `npm run lint`, `npm run typecheck`, `npm run test:run`, and
`npm run format`.
