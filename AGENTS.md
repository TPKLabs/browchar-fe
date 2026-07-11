<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Folder structure

Organizá por responsabilidad, **no** por co-ubicación en la ruta. Una carpeta de
ruta nunca contiene componentes reutilizables ni lógica de dominio.

- `src/app/` = solo **rutas** (App Router). `page.tsx` / `layout.tsx` finos:
  resuelven `params`/`searchParams`/datos y delegan la UI. No existe `pages/`.
- `src/components/<dominio>/` = **UI de dominio** reutilizable (primitivos shadcn
  en `src/components/ui/`).
- `src/lib/<dominio>/` = **lógica no-UI** (schemas Zod, helpers). Tipos en
  `src/lib/types/`, cliente HTTP en `src/lib/api/`, mocks en `src/lib/mocks/`.

Importá siempre por alias `@/...`. Todo archivo nuevo bajo `src/app|components|lib`
va con su test pareado (salvo `*.types.ts`, `index.*` y `components/ui/`). Ver
"Estructura del proyecto" en el README para el detalle y un ejemplo.
