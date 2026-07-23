import { http, HttpResponse } from "msw";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/types";
import type { CharacterListResponse } from "@/types";

/**
 * Handlers base de Characters (DEV-200). Defaults inertes: GET devuelve
 * envelopes vacíos / 404 genérico, POST/PATCH devuelven 501 — casi todo test
 * necesita su propio fixture, así que un happy-path por defecto solo
 * escondería una configuración faltante. Cada test lo pisa con
 * `server.use(...)` (ver `src/mocks/server.ts`).
 */
export const charactersHandlers = [
  http.get("/characters", ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? DEFAULT_PAGE);
    const pageSize = Number(
      url.searchParams.get("pageSize") ?? DEFAULT_PAGE_SIZE,
    );
    const body: CharacterListResponse = {
      data: [],
      meta: { page, pageSize, total: 0 },
    };
    return HttpResponse.json(body);
  }),

  http.get("/characters/:id", ({ params }) => {
    return HttpResponse.json(
      { message: `Character ${String(params.id)} no encontrado` },
      { status: 404 },
    );
  }),

  http.post("/characters", () => {
    return HttpResponse.json(
      { message: "POST /characters sin handler configurado en este test" },
      { status: 501 },
    );
  }),

  http.patch("/characters/:id", () => {
    return HttpResponse.json(
      {
        message: "PATCH /characters/:id sin handler configurado en este test",
      },
      { status: 501 },
    );
  }),

  // DEV-52 (Character: Eliminar) todavía no tiene hook consumidor — handler
  // agregado igual porque el ticket DEV-200 lo lista explícitamente en el
  // alcance, listo para cuando exista.
  http.delete("/characters/:id", () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
