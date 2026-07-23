<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Folder structure

Organizá por responsabilidad, **no** por co-ubicación en la ruta ni por
dominio. Una carpeta de ruta nunca contiene componentes reutilizables ni
lógica de dominio; `src/lib/` no existe — cada tipo de artefacto no-UI tiene
su propia carpeta top-level:

- `src/app/` = solo **rutas** (App Router). `page.tsx` / `layout.tsx` finos:
  resuelven `params`/`searchParams`/datos y delegan la UI. No existe `pages/`.
- `src/components/<dominio>/` = **UI de dominio** reutilizable (primitivos shadcn
  en `src/components/ui/`).
- `src/hooks/` = hooks de TanStack Query (`useGames.ts`, `usePlaybooks.ts`,
  `useCreateCharacter.ts`), uno por endpoint/mutación, sin subcarpetas por
  dominio.
- `src/types/` = re-exports de `@tpklabs/browchar-contracts` + vistas
  solo-FE (`CharacterSummary`). **Regla (DEV-197): TODOS los tipos de request
  y response vienen del paquete** — nunca interfaces locales espejo. Convención
  de nombres: `<Entidad><Operación>{Response,RequestBody,RequestParams}` con
  operaciones List/Get/Create/Update/Delete (ej. `CharacterUpdateRequestBody`,
  `CharacterListResponse`). Código nuevo importa directo del paquete; los
  re-exports de `src/types/*` existen por compatibilidad. Un tipo derivado con
  narrowing deliberado (ej. `Required<CharacterUpdateRequestBody>` en
  `useUpdateCharacter`) es válido solo si DERIVA del tipo del paquete.
- `src/api/` = el cliente HTTP (`client.ts`).
- `src/schemas/` = schemas Zod + lógica de validación/defaults específica de un
  dominio (ej. `characterSchema.ts`: schema y defaults del form de creación de
  personaje). No es un hook ni un tipo ni un util genérico.
- `src/mocks/` = infraestructura de testing MSW (DEV-200): `server.ts`
  (`setupServer`, levantado en `vitest.setup.ts`) y `handlers/<dominio>.ts`
  (uno por recurso — `characters.ts`, `playbooks.ts`, `games.ts` — agregados en
  `handlers/index.ts`). Cada handler expone un default inerte (404/501); los
  tests lo pisan con `server.use(...)` por caso. Ver la sección "Tests de red"
  más abajo.
- `src/utils/` = helpers genéricos, reusables entre dominios (`cn.ts`,
  `dates.ts`). Si algo es específico de un dominio, no es un util — va en
  `schemas/`, `hooks/` o el componente que lo usa.

Importá siempre por alias `@/...`. Todo archivo nuevo bajo
`src/app|components|hooks|types|api|schemas|utils` va con su test pareado
(salvo `*.types.ts`, `index.*` y `components/ui/`). `src/mocks/**` es la
excepción: es infraestructura de testing en sí misma (la ejercita cada test
que la usa vía `server.use(...)`), así que no lleva su propio `.test.ts` y
está excluida del gate de coverage (DEV-37) — igual criterio que la API con
`*.module.ts`. Ver "Estructura del proyecto" en el README para el detalle y un
ejemplo.

## Tests de red: MSW, no `fetch` a mano

Todo test de un hook o container que pega a la red usa MSW
(`src/mocks/server.ts`), no `vi.stubGlobal("fetch", ...)` (DEV-200, retirado).
Cada test registra su respuesta con `server.use(...)` antes de renderizar; se
resetea solo entre tests (`vitest.setup.ts`). Para asserts que antes leían
`fetchMock.mock.calls` (URL, query, body), ahora se capturan adentro del
resolver (`request.url`, `await request.json()`) en una variable local y se
verifican después del `await waitFor(...)` — no hay un mock cuyas llamadas
inspeccionar. Si el endpoint no tiene handler todavía, se agrega a
`src/mocks/handlers/<dominio>.ts`. Detalle y ejemplo completo en la skill
`add-feature`.

## Coverage gate (DEV-37)

`npm run test:coverage` corre Vitest con `--coverage` (provider v8) y aplica
los `thresholds` de `vitest.config.mts`. La corrida (y el CI) **falla** si la
cobertura global baja de **88% statements / 82% branches / 85% functions /
88% lines**. El `include`/`exclude` del coverage refleja la misma convención de
test pareado de arriba (excluye `*.types.ts`, `index.*`, `components/ui/` y
`app/layout.tsx`, el shell RSC raíz; las pages con test pareado SÍ cuentan).
