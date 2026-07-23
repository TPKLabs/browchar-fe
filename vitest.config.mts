import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["node_modules", ".next", "e2e"],
    // Aire por encima del asyncUtilTimeout (5s en vitest.setup.ts) para que el
    // test no se corte antes de que un `findBy*` termine de esperar bajo la
    // sobrecarga de --coverage.
    testTimeout: 15000,
    coverage: {
      provider: "v8",
      // En Vitest 4 definir `include` ya reporta TODO archivo que matchea, lo
      // haya importado un test o no (el viejo `all: true` es implícito) — así
      // un archivo sin test baja el número y el umbral significa algo.
      include: ["src/**/*.{ts,tsx}"],
      // Exclusiones alineadas con la convención de test pareado (AGENTS.md):
      // se gatea el código que escribimos y testeamos. Fuera:
      // - *.types.ts / types/ / index.* → solo tipos y barrels, exentos de test.
      // - components/ui/ → primitivos shadcn vendored.
      // - app/layout.tsx → shell RSC raíz (fuentes + html), sin lógica (análogo
      //   al bootstrap de la API). Las pages SÍ entran: tienen test pareado.
      // - mocks/ → infraestructura de testing (handlers MSW, DEV-200), no
      //   lógica de app; sus ramas default (404/501 "sin handler configurado
      //   en este test") solo corren cuando un test NO las pisa, que por
      //   diseño nunca pasa — medirlas arrastraba el agregado al piso del
      //   umbral sin decir nada real (análogo a excluir *.module.ts en la API).
      exclude: [
        "src/**/*.types.ts",
        "src/types/**",
        "src/**/index.{ts,tsx}",
        "src/components/ui/**",
        "src/app/layout.tsx",
        "src/mocks/**",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.d.ts",
      ],
      reporter: ["text", "text-summary", "html"],
      // Umbral acordado (DEV-37). Medido sobre el set de arriba (2026-07-17:
      // ~92% stmts / 87% branch / 91% funcs / 93% lines) y fijado unos puntos
      // por debajo para dar aire sin volverse decorativo. El CI corta si baja.
      thresholds: {
        statements: 88,
        branches: 82,
        functions: 85,
        lines: 88,
      },
    },
  },
});
