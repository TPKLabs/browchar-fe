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
- `src/types/` = tipos de dominio, espejo de los modelos de browchar-api.
  Los tipos y la validación compartidos con la API (`FieldType`,
  `FieldDefinition`, `buildTemplateSchema`, los schemas de request) vienen del
  paquete `@tpklabs/browchar-contracts` — no los redefinas a mano (DEV-153).
  `src/types/*` re-exporta de ahí por compatibilidad; código nuevo importa
  directo del paquete.
- `src/api/` = el cliente HTTP (`client.ts`).
- `src/schemas/` = schemas Zod + lógica de validación/defaults específica de un
  dominio (ej. `characterSchema.ts`: schema y defaults del form de creación de
  personaje). No es un hook ni un tipo ni un util genérico.
- `src/mocks/` = datos de ejemplo compartidos entre pantallas (ej.
  `sampleCharacters.ts`, usado tanto por la home como por `/characters`).
- `src/utils/` = helpers genéricos, reusables entre dominios (`cn.ts`,
  `dates.ts`). Si algo es específico de un dominio, no es un util — va en
  `schemas/`, `hooks/` o el componente que lo usa.

Importá siempre por alias `@/...`. Todo archivo nuevo bajo
`src/app|components|hooks|types|api|schemas|mocks|utils` va con su test
pareado (salvo `*.types.ts`, `index.*` y `components/ui/`). Ver "Estructura
del proyecto" en el README para el detalle y un ejemplo.
