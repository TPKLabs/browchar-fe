---
name: add-feature
description: Wire an existing domain type from src/lib/types into a full feature -- zod schema, react-hook-form, and a TanStack Query hook. Use when asked to build a form, mutation, or data-fetching feature for a domain entity (Character, Playbook, etc.).
---

# Add a feature for an existing domain type

This project's domain types in `src/lib/types/*.types.ts` are a deliberate
mirror of `browchar-api`'s Prisma models and Zod request schemas (see the
header comment in `src/lib/types/index.ts`). Don't invent fields — the type
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

Co-locate the schema near the feature (not inside `src/lib/types`, which is
kept as pure mirrored type declarations with no runtime logic — that's also
why `*.types.ts` files are exempt from the paired-test rule).

## 3. Form with react-hook-form + zod

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
```

Use `zodResolver(schema)` so validation is driven by the schema from step 2,
not duplicated in the form.

## 4. TanStack Query hook

Wrap the request in a `useMutation` (for create/update) or `useQuery` (for
reads) hook. Keep query keys consistent and colocated with the feature (e.g.
`["characters", characterId]`). Don't call `fetch` directly from components —
funnel it through the hook so caching/invalidation stays centralized.

## 5. Tests

Add tests for:

- The Zod schema: at least one valid input and one invalid input per
  constraint you added.
- The hook or the form component's observable behavior (renders errors,
  calls the mutation with the right payload) — not implementation details.

This matches the pre-commit paired-test rule: any new file under `src/app`,
`src/components`, or `src/lib` needs a sibling `*.test.ts(x)` unless it's
exempt (pure types, barrels, shadcn `components/ui` vendor files).

## 6. Before finishing

Run `npm run lint`, `npm run typecheck`, `npm run test:run`, and
`npm run format`.
