# Changelog

This file does **not** log every change. It only tracks, per [Unreleased] release:

- **Fixed** — bugs that were actually resolved (`fix:` commits).
- **Known Issues** — bugs found but intentionally left unresolved, to be fixed later.
- **Future Considerations** — risks, conflicts, or follow-ups implied by a change made now.

Entries are added automatically by `npm run commit` — see
[`.claude/skills/changelog/SKILL.md`](.claude/skills/changelog/SKILL.md) for how to flag
a known issue or a future consideration in a commit message.

## [Unreleased]

### Fixed

- **characters:** point home CTA to the creation form ([#16](https://github.com/LucianABC/browchar-fe/pull/16))
- **dev:** pin frontend dev server to port 3001
- Pre-commit hook (`.husky/pre-commit`) no longer succeeds when an earlier
  step (typecheck) fails — the three checks now run chained with `&&`
  instead of as unchained lines. ([#4](https://github.com/LucianABC/browchar-fe/pull/4))
- `scripts/check-test-pairs.mjs` paired-test gate now actually blocks
  commits — it compared lint-staged's absolute file paths against
  `git diff`'s repo-relative paths, so the check never matched anything.
  ([#4](https://github.com/LucianABC/browchar-fe/pull/4))
- `--font-sans` in `src/app/globals.css` referenced itself instead of
  `--font-geist-sans`, silently dropping the app to the browser's default
  font. ([#4](https://github.com/LucianABC/browchar-fe/pull/4))
- `FieldDefinition.defaultValue` / `maxValue` / `options` were typed
  `unknown`, which let malformed template entries pass type-checking
  despite the field's own doc comments already stating the intended shape.
  ([#4](https://github.com/LucianABC/browchar-fe/pull/4))
- `character.types.ts`'s docblock incorrectly claimed `Playbook` mirrors
  `updatedAt` the same way `Character` does; `Playbook` has no `updatedAt`
  field. ([#4](https://github.com/LucianABC/browchar-fe/pull/4))
- `package-lock.json` had 20 duplicate `node_modules/*` entries (JSON's
  last-write-wins meant corrupted copies silently overrode the correct
  ones), including two pure-JS packages incorrectly restricted to a single
  OS (`freebsd`, `darwin`), which broke `npm install`/`npm ci` on every
  other platform. Regenerated the lockfile from scratch.
  ([#4](https://github.com/LucianABC/browchar-fe/pull/4))
- Resolved a real `@babel/core` v7/v8 peer conflict between `shadcn` and an
  unused optional peer of `@vitejs/plugin-react` (`@rolldown/plugin-babel`)
  via a scoped `overrides` entry, instead of disabling peer-dep checking
  project-wide. ([#4](https://github.com/LucianABC/browchar-fe/pull/4))
- No `.gitattributes` existed, so on machines with `core.autocrlf=true`
  every checkout silently converted the repo's LF files to CRLF, making
  `prettier --check` flag nearly the whole tree with no real edits. Added
  `eol=lf`. ([#4](https://github.com/LucianABC/browchar-fe/pull/4))
- `apiClient`'s `buildHeaders` merged custom headers with a plain object
  spread (`{ ...headers }`), which only works when `headers` is a
  `Record<string, string>` — the type it's declared to accept (`HeadersInit`)
  also allows a `Headers` instance or a `[string, string][]` tuple array,
  and both of those were silently dropped or corrupted instead of merged.
  Now normalizes via `new Headers(...)`.
  ([#6](https://github.com/LucianABC/browchar-fe/pull/6))

### Known Issues

- CharacterDetail's Cancelar button (src/components/characters/characterDetail.tsx) reverts to the character's original pre-session values instead of the last successfully saved edit, because handleCancel resets to a memoized defaultValues pinned to the initial props rather than react-hook-form's own updated baseline. Repro: edit a field, Guardar cambios, edit again, Cancelar — the first save is silently discarded. Fix: use reset() with no arguments (reverts to react-hook-form's internally tracked defaults, which handleValid's reset(data) already keeps in sync) instead of reset(defaultValues).
- `apiClient`'s `request` doesn't catch network-level failures (e.g. `fetch`
  rejecting with a `TypeError` when offline or on a DNS/CORS failure) — only
  non-2xx HTTP responses are wrapped in `ApiError`. Callers doing
  `catch (e) { if (e instanceof ApiError) ... }` will miss network failures
  entirely and need a separate branch for them until this is addressed.
  ([#6](https://github.com/LucianABC/browchar-fe/pull/6))

### Future Considerations

- "Guardar cambios" gates on formState.isDirty; auto-save (fire every 7s while isDirty, per a requirement noted on DEV-65) should hook into that same signal once PATCH /characters/:id exists.
- CharacterListItem is mirrored by hand from browchar-api; if the API response shape changes the front drifts silently. Tracked in DEV-197 (move response types into @tpklabs/browchar-contracts as the single source of truth).
- `buildTemplateSchema` (shared `@tpklabs/browchar-contracts`) validates required text with `min(1)` but no `.trim()`, so a whitespace-only value (`"   "`) satisfies a required text field. Inherited from the backend's original template validation and adopted as-is when unifying in DEV-153; tightening it (trim in the shared builder) is a change to the published package + API — candidate for a `0.2.0`.
- FE response types (`Character` / `CharacterView`, pagination envelope) are still hand-written in `src/lib/types` — `@tpklabs/browchar-contracts` only owns request/template contracts so far. If the API's Prisma-derived response shapes change, these can drift until the package exposes them too.
- `CHECKBOX` fields with `options` are modelled as a multi-select by the shared `buildTemplateSchema` (it accepts one/several of the option values), but the FE renders every checkbox as a single boolean and `buildDefaultValues` seeds it to `false`. A template defining a `CHECKBOX` **with** `options` would therefore fail validation on submit with no way to fix it from the current UI. No current template uses this shape; if one is added, render a multi-select and default it to `[]`/`""` (surfaced reviewing DEV-153).
- submit is a local stub via an onSubmit seam. The real POST /characters mutation (TanStack Query) plus a QueryClientProvider still need wiring in the API-integration subtask before characters actually persist.
