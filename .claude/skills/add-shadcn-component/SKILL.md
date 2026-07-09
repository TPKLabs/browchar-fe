---
name: add-shadcn-component
description: Scaffold or customize a shadcn/ui primitive in this project, respecting components.json and this repo's aliases. Use when asked to add a UI component, primitive, or shadcn piece (button, dialog, input, etc.).
---

# Add a shadcn/ui component

This project uses shadcn/ui (`components.json`), not hand-rolled UI primitives. Don't
write a component from scratch if shadcn already ships one.

## 1. Check the project is initialized

Look for `components.json` at the repo root.

- **If it exists**: read it first. It is the source of truth for `style`,
  `baseColor`, `iconLibrary` and — most importantly — the `aliases` block
  (`@/components`, `@/components/ui`, `@/lib`, `@/hooks`). Never hardcode a
  relative import path (`../../ui/button`) when an alias exists.
- **If it doesn't exist** (e.g. a fresh branch cut before shadcn was set up):
  initialize it with these exact settings so every branch converges on the
  same config once merged:
  ```bash
  npx shadcn@latest init
  ```
  When prompted, match: style `base-nova`, base color `neutral`, CSS
  variables `yes`, icon library `lucide`, RSC `yes`, no prefix. Confirm with
  the user before changing any of these if the prompt defaults differ.

## 2. Add the component

```bash
npx shadcn@latest add <component-name>
```

This writes into `src/components/ui/` (per the `ui` alias) and may extend
`src/app/globals.css` with new theme tokens — don't hand-edit generated
primitives beyond what shadcn's own diff produces unless you're intentionally
customizing.

## 3. Customizing beyond the vendor default

If you add variants/behavior on top of the generated primitive (not just using
it as-is), treat that added logic as project code:

- Use `cva` (`class-variance-authority`) for variants, consistent with the
  rest of `src/components/ui`.
- Use the `cn()` helper from `@/lib/utils` (never manual string
  concatenation) for conditional class names.
- Write a `*.test.tsx` next to the component for the custom behavior you
  added — plain vendor primitives with no added logic are exempt from the
  pre-commit paired-test rule (see `scripts/check-test-pairs.mjs`,
  `components/ui/` is in the exempt list), but anything you extend yourself
  isn't automatically covered by that exemption in spirit, so test it.

## 4. Before finishing

Run `npm run lint`, `npm run typecheck`, and `npm run format`. These also run
in the pre-commit hook, so fix issues now rather than fighting the hook later.
