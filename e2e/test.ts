import { test as base, expect } from "@playwright/test";

/**
 * Prefijo exclusivo para las llamadas a la API mockeada (DEV-199, hallazgo de
 * review). `NEXT_PUBLIC_API_URL` se fuerza a este valor en
 * `playwright.config.ts` — sin esto, con `BASE_URL=""` los fetches del
 * `apiClient` van a las MISMAS rutas relativas que las propias pages de Next
 * (`/characters`, `/characters/:id`), así que:
 *  - una request sin mock a `/characters` cae en la page real de Next.js (HTML
 *    200), no en un error de red — el fallback de `parseBody` en `apiClient`
 *    la toma como texto plano y la request "pasa" en vez de fallar visible.
 *  - los fetches internos de RSC/prefetch que dispara el App Router al
 *    navegar (`<Link href="/characters/:id">`) apuntan a esa misma ruta y
 *    también son `resourceType() === "fetch"`, así que un mock de
 *    `/characters/:id` los intercepta también, aunque no sean la llamada real
 *    del `apiClient`.
 * Namespacear la API bajo `API_PREFIX` (una ruta que Next NUNCA sirve) elimina
 * la colisión de raíz: nada del propio Next matchea este prefijo.
 */
export const API_PREFIX = "/__e2e_api__";

/**
 * `test` extendido: antes de cada spec, registra un catch-all que ABORTA
 * cualquier request bajo `API_PREFIX` sin mock más específico — mismo
 * espíritu que `onUnhandledRequest: "error"` en MSW (DEV-200): un mock
 * faltante rompe visible (la UI cae a su estado de error) en vez de pasar en
 * silencio. Playwright corre los handlers que matchean una URL en orden
 * INVERSO al de registro (el más nuevo primero, con `route.fallback()` para
 * cederle al anterior); como este catch-all se registra ACÁ, antes de que
 * corra el cuerpo del test, cualquier mock que el test registre después es
 * "más nuevo" y gana automáticamente sin tocar nada en los specs.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route(`**${API_PREFIX}/**`, (route) => route.abort());
    await use(page);
  },
});

export { expect };
