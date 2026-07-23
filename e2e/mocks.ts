import type { Page, Route } from "@playwright/test";
import type {
  Character,
  CharacterListResponse,
  PlaybookView,
  ValidationError,
} from "@tpklabs/browchar-contracts";
import { API_PREFIX } from "./test";

/**
 * Helpers de mock de red para los E2E (DEV-199) — equivalente de
 * `page.route()` a los handlers MSW de la suite de vitest (DEV-200), mismo
 * espíritu: cada test registra la respuesta que necesita, nada corre contra
 * `browchar-api` real.
 *
 * Patrones de URL: `**\/recurso*` (comodín simple, sin cruzar `/`) matchea la
 * lista/creación (`/characters`, con o sin query string); `**\/recurso/*`
 * matchea el detalle/update de un id (`/characters/:id`) sin pisar el
 * anterior, porque el `/` extra no lo cruza un `*` simple. Todos van bajo
 * `API_PREFIX` (ver `e2e/test.ts`): una request sin mock bajo ese prefijo la
 * aborta el catch-all de `test.ts`, no cae en una page real de Next ni queda
 * en un limbo silencioso.
 */
async function jsonRoute(
  page: Page,
  pattern: string,
  method: string,
  handler: (route: Route) => Promise<void> | void,
): Promise<void> {
  await page.route(pattern, async (route) => {
    // Defensa adicional (ya no debería dispararse con el namespacing de
    // API_PREFIX, que separa las llamadas a la API de las propias rutas y
    // fetches de RSC/prefetch de Next): solo intercepta fetch/XHR, no
    // navegación de documento.
    const resourceType = route.request().resourceType();
    if (resourceType !== "fetch" && resourceType !== "xhr") {
      await route.fallback();
      return;
    }
    if (route.request().method() !== method) {
      await route.fallback();
      return;
    }
    await handler(route);
  });
}

export function mockPlaybooksList(page: Page, playbooks: PlaybookView[]) {
  return jsonRoute(page, `**${API_PREFIX}/playbooks*`, "GET", (route) =>
    route.fulfill({ json: playbooks }),
  );
}

export function mockPlaybookDetail(page: Page, playbook: PlaybookView) {
  return jsonRoute(page, `**${API_PREFIX}/playbooks/*`, "GET", (route) =>
    route.fulfill({ json: playbook }),
  );
}

export function mockCharactersList(
  page: Page,
  envelope: CharacterListResponse,
) {
  return jsonRoute(page, `**${API_PREFIX}/characters*`, "GET", (route) =>
    route.fulfill({ json: envelope }),
  );
}

export function mockCharacterDetail(page: Page, character: Character) {
  return jsonRoute(page, `**${API_PREFIX}/characters/*`, "GET", (route) =>
    route.fulfill({ json: character }),
  );
}

/** Envelope de error que devuelve la API en 400/404 (ver `ApiError` en `src/api/client.ts`). */
interface ApiErrorBody {
  message: string;
  errors?: ValidationError[];
}

interface MutationResult {
  status?: number;
  json: Character | ApiErrorBody;
}

export function mockCreateCharacter(
  page: Page,
  handler: (body: unknown) => MutationResult,
) {
  return jsonRoute(
    page,
    `**${API_PREFIX}/characters*`,
    "POST",
    async (route) => {
      const { status = 201, json } = handler(route.request().postDataJSON());
      await route.fulfill({ status, json });
    },
  );
}

export function mockUpdateCharacter(
  page: Page,
  handler: (body: unknown) => MutationResult,
) {
  return jsonRoute(
    page,
    `**${API_PREFIX}/characters/*`,
    "PATCH",
    async (route) => {
      const { status = 200, json } = handler(route.request().postDataJSON());
      await route.fulfill({ status, json });
    },
  );
}
