# browchar-web

Frontend de Browchar (Next.js). Consume la API en [`browchar-api`](#conexión-con-el-backend).

## Stack

- **Framework:** [Next.js 16](https://nextjs.org/docs) (App Router) + React 19 + TypeScript
- **UI:** [shadcn/ui](https://ui.shadcn.com/) sobre `@base-ui/react`, Tailwind CSS v4, `class-variance-authority`, `tailwind-merge`
- **Formularios/validación:** `react-hook-form` + `zod` (vía `@hookform/resolvers`)
- **Data fetching:** TanStack Query (`@tanstack/react-query`), sobre un cliente HTTP propio en [`src/lib/api/client.ts`](src/lib/api/client.ts)
- **Testing:** Vitest + Testing Library (jsdom)
- **Lint/format:** ESLint, Prettier
- **Git hooks:** Husky + lint-staged, commitlint (Conventional Commits)

## Prerrequisitos

- Node.js 20+
- npm
- El backend [`browchar-api`](#conexión-con-el-backend) corriendo localmente (por defecto en `http://localhost:3000`)

## Setup

```bash
npm install
```

Esto también deja instalados los git hooks de husky (script `prepare`).

Crear `.env.local` apuntando al back local:

```env
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

Levantar el dev server:

```bash
npm run dev
```

La app corre en `http://localhost:3001` (puerto fijo, seteado en el script `dev`) para no chocar con el puerto por defecto del back (`3000`).

## Conexión con el backend

El front no llama a `fetch` directo: todo pasa por `apiClient` ([`src/lib/api/client.ts`](src/lib/api/client.ts)), que:

- Resuelve la base URL desde `NEXT_PUBLIC_API_URL`
- Serializa el body a JSON y setea `Content-Type` por defecto
- Normaliza errores no-2xx en una `ApiError` (con `status` y, si el back manda el envelope `{ message, errors }`, también `errors: ValidationError[]`)

Todavía no hay autenticación (el hook para agregar `Authorization` ya está en `buildHeaders`, pendiente de que exista sesión).

Si las requests fallan o hay errores de CORS: verificar que la API esté corriendo y que `NEXT_PUBLIC_API_URL` coincida con su URL.

## Estructura del proyecto

El código vive en `src/`, organizado **por responsabilidad, no por co-ubicación
en la ruta**. Una carpeta de ruta (`src/app/.../`) no debe contener componentes
reutilizables ni lógica de dominio.

- **`src/app/`** — **rutas** (App Router). Cada `page.tsx` / `layout.tsx` es
  fino: resuelve `params`/`searchParams`/datos y delega la UI. No hay carpeta
  `pages/` (eso es el viejo Pages Router). Junto a cada archivo va su test
  pareado.
- **`src/components/`** — **UI reutilizable**. Primitivos shadcn/ui en
  `src/components/ui/` (vendor); componentes de dominio agrupados por entidad en
  `src/components/<dominio>/` (ej. `src/components/characters/`).
- **`src/lib/`** — **lógica no-UI**, agrupada por área: `api/` (cliente HTTP),
  `types/` (tipos de dominio, espejo del back), `mocks/`, y lógica por dominio en
  `src/lib/<dominio>/` (ej. schemas Zod en `src/lib/characters/`).

**Regla:** un `page.tsx` importa desde `@/components/...` y `@/lib/...` (siempre
por alias `@/`, nunca relativo profundo). La UI reutilizable y la
validación/lógica **nunca** viven dentro de la carpeta de la ruta.

Ejemplo — feature "crear personaje" (DEV-50):

```
src/app/characters/new/page.tsx                    ← ruta (fina)
src/components/characters/character-create-form.tsx ← UI de dominio
src/components/characters/dynamic-field.tsx
src/lib/characters/character-schema.ts             ← validación Zod (no-UI)
src/lib/mocks/playbooks.ts
```

Cada archivo nuevo bajo `src/app`, `src/components` o `src/lib` va con su test
pareado al lado (lo exige el pre-commit), salvo exentos: `*.types.ts`, barrels
`index.*`, y vendor `components/ui/`.

## Scripts

| Script                  | Qué hace                                                        |
| ----------------------- | --------------------------------------------------------------- |
| `npm run dev`           | Dev server en el puerto 3001                                    |
| `npm run build`         | Build de producción                                             |
| `npm start`             | Sirve el build de producción                                    |
| `npm run lint`          | ESLint                                                          |
| `npm run typecheck`     | `tsc --noEmit`                                                  |
| `npm run format`        | Prettier (escribe cambios)                                      |
| `npm run format:check`  | Prettier (solo chequea)                                         |
| `npm test` / `test:run` | Vitest (watch / una sola corrida)                               |
| `npm run commit`        | Commit guiado (Conventional Commits + actualiza `CHANGELOG.md`) |

Antes de dar por terminado un cambio, correr `lint`, `typecheck` y `test:run`.

## Convenciones de commits

Usar `npm run commit -- -m "..."` en vez de `git commit -m` directo, para que el mensaje pase por commitlint y `CHANGELOG.md` se actualice solo. En cada commit corren automáticamente (pre-commit hook): lint-staged (ESLint --fix, chequeo de tests pareados, Prettier), type-check y tests unitarios. En CI (`CI=true`) los hooks de husky se saltean.

Ver también los agentes/skills del repo (`commit-conventions`, `changelog`, `pre-commit`, `first-setup`) para el detalle de cada uno.
