# browchar-web

Frontend de Browchar (Next.js). Consume la API en [`browchar-api`](#conexión-con-el-backend).

## Stack

- **Framework:** [Next.js 16](https://nextjs.org/docs) (App Router) + React 19 + TypeScript
- **UI:** [shadcn/ui](https://ui.shadcn.com/) sobre `@base-ui/react`, Tailwind CSS v4, `class-variance-authority`, `tailwind-merge`
- **Formularios/validación:** `react-hook-form` + `zod` (vía `@hookform/resolvers`)
- **Data fetching:** TanStack Query (`@tanstack/react-query`), sobre un cliente HTTP propio en [`src/api/client.ts`](src/api/client.ts)
- **Testing:** Vitest + Testing Library (jsdom)
- **Lint/format:** ESLint, Prettier
- **Git hooks:** Husky + lint-staged, commitlint (Conventional Commits)

## Prerrequisitos

- Node.js 20+
- npm
- Una API de Browchar a la que apuntar — local o desplegada. Ver [Cómo correr la app](#cómo-correr-la-app).

## Setup

```bash
npm install
```

Esto también deja instalados los git hooks de husky (script `prepare`).

Copiar el archivo de ejemplo de entorno y ajustarlo según el modo que uses (ver abajo):

```bash
cp .env.example .env.local
```

Levantar el dev server:

```bash
npm run dev
```

La app corre en `http://localhost:3001` (puerto fijo, seteado en el script `dev`) para no chocar con el puerto por defecto del back (`3000`).

## Cómo correr la app

El front no tiene backend propio: consume `browchar-api`. A qué API apunta se
controla **únicamente** con `NEXT_PUBLIC_API_URL` (leída en
[`src/api/client.ts`](src/api/client.ts)). Hay dos modos.

### Modo A — Todo local (desarrollo del stack completo)

Para trabajar sobre el back y el front a la vez. Requiere **PostgreSQL corriendo
en `localhost:5432`** con el usuario/DB del `.env` del back (`nest_user` /
`rpg_sheets_db`).

1. **Backend** — en `browchar-api` (ver su Skill `first-setup` para el detalle):

   ```bash
   cd ../browchar-api
   npx prisma migrate deploy   # aplica migraciones
   npx prisma generate         # genera el client
   npx tsx prisma/seed.ts      # carga systems, games y playbooks
   npm run start:dev           # API en http://localhost:3000
   ```

2. **Frontend** — en este repo, `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3000"
   ```

   ```bash
   npm run dev                 # http://localhost:3001
   ```

> Si `/playbooks` (o el form de creación) queda en "Cargando…" y luego muestra
> "No se pudieron cargar los playbooks", casi siempre es que la API no está
> levantada o la DB no está seedeada: revisá el paso 1.

### Modo B — Front local contra la API de producción

Para iterar sobre el front sin levantar Postgres + API localmente. Apunta el
front a la API ya desplegada.

En `.env.local`:

```env
NEXT_PUBLIC_API_URL="https://<api-en-railway>.up.railway.app"
```

```bash
npm run dev                   # http://localhost:3001, pegándole a prod
```

> La API se despliega en **Railway** y este front en **Vercel** (épic DEV-163;
> ver `deployment-plan`). Mientras la API no esté desplegada, esta URL todavía no
> existe y sólo aplica el Modo A. Cuando esté arriba, reemplazá el placeholder
> por la URL pública real de Railway.
>
> El front **desplegado** (Vercel) usa esta misma variable, pero seteada como
> Environment Variable del proyecto en Vercel — no vía `.env.local`.

## Conexión con el backend

El front no llama a `fetch` directo: todo pasa por `apiClient` ([`src/api/client.ts`](src/api/client.ts)), que:

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
- **`src/hooks/`** — hooks de TanStack Query (`useGames.ts`,
  `usePlaybooks.ts`, `useCreateCharacter.ts`), uno por endpoint/mutación.
- **`src/types/`** — tipos de dominio, espejo del back.
- **`src/api/`** — el cliente HTTP (`client.ts`).
- **`src/schemas/`** — schemas Zod + validación/defaults específicos de un
  dominio (ej. `characterSchema.ts`).
- **`src/mocks/`** — datos de ejemplo compartidos entre pantallas.
- **`src/utils/`** — helpers genéricos y reusables entre dominios (`cn.ts`,
  `dates.ts`).

No existe `src/lib/`: cada tipo de artefacto no-UI vive en su propia carpeta
top-level en vez de agruparse por dominio dentro de una carpeta genérica.

**Regla:** un `page.tsx` importa desde `@/components/...`, `@/hooks/...`,
`@/types/...`, etc. (siempre por alias `@/`, nunca relativo profundo). La UI
reutilizable y la validación/lógica **nunca** viven dentro de la carpeta de
la ruta.

Ejemplo — feature "crear personaje" (DEV-50):

```
src/app/characters/new/page.tsx                    ← ruta (fina)
src/components/characters/characterCreateForm.tsx ← UI de dominio
src/components/characters/dynamicField.tsx
src/schemas/characterSchema.ts                    ← validación Zod (no-UI)
src/hooks/useCreateCharacter.ts                   ← mutación TanStack Query
src/mocks/sampleCharacters.ts
```

Cada archivo nuevo bajo `src/app`, `src/components`, `src/hooks`, `src/types`,
`src/api`, `src/schemas`, `src/mocks` o `src/utils` va con su test pareado al
lado (lo exige el pre-commit), salvo exentos: `*.types.ts`, barrels `index.*`,
y vendor `components/ui/`.

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
