import { defineConfig, devices } from "@playwright/test";
import { API_PREFIX } from "./e2e/test";

/**
 * E2E black-box (DEV-199): dirige un browser real contra la app renderizada,
 * mockeando la API en el borde de red por test (`page.route`, ver
 * `e2e/mocks.ts`) — no depende de `browchar-api` ni de Docker. Decisión
 * documentada en el README ("E2E tests").
 *
 * `NEXT_PUBLIC_API_URL: API_PREFIX` (no `""`) namespacea las llamadas a la API
 * bajo una ruta que Next.js nunca sirve — con `""` los fetches del cliente van
 * a las mismas rutas relativas que las propias pages (`/characters`,
 * `/characters/:id`), lo que deja una request sin mock caer silenciosamente
 * en la page real de Next (HTML 200) en vez de fallar visible, y hace que los
 * mocks también intercepten los fetches internos de RSC/prefetch del App
 * Router. Ver `e2e/test.ts` para el detalle completo. Determinista sin
 * importar qué tenga configurado el `.env.local` de quien corre los tests
 * localmente (mismo motivo que vitest: `BASE_URL` ahí cae en `""` porque no
 * carga `.env.local`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["html", { open: "never" }], ["github"]] : "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3001",
    // Reutilizar un `next dev` local puede cargar NEXT_PUBLIC_API_URL desde
    // `.env.local` y saltear por completo los mocks. El runner debe ser dueño
    // del servidor para garantizar el namespace de API y el cache E2E.
    reuseExistingServer: false,
    env: {
      BROWCHAR_E2E: "1",
      NEXT_PUBLIC_API_URL: API_PREFIX,
    },
    timeout: 120_000,
  },
});
