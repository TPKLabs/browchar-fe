import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * Server MSW para la suite de vitest (DEV-200): intercepta `fetch` a nivel de
 * red, así los tests ejercitan el `apiClient` real (baseURL, headers, parsing
 * de `ApiError`) en vez de mockear `global.fetch` a mano. Se levanta una vez
 * en `vitest.setup.ts`; cada test agrega sus handlers puntuales con
 * `server.use(...)`, que se resetean automáticamente entre tests.
 */
export const server = setupServer(...handlers);
