import { http, HttpResponse } from "msw";

/**
 * Handlers base de Characters (DEV-200). Defaults inertes de verdad: TODOS
 * devuelven 404/501, nunca un 200/204 "vacío" — un listado vacío o un delete
 * exitoso son resultados que un test tiene que pedir explícitamente con
 * `server.use(...)` (ver `src/mocks/server.ts`), no algo que el default
 * decida por él. Si el default devolviera un 200 con lista vacía, un test de
 * "estado vacío" podría pasar sin haber configurado nada — pasaría igual
 * aunque el mock esté roto o directamente ausente, que es exactamente lo que
 * este gate quiere evitar.
 */
export const charactersHandlers = [
  http.get("/characters", () => {
    return HttpResponse.json(
      { message: "GET /characters sin handler configurado en este test" },
      { status: 501 },
    );
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

  // DEV-52 (Character: Eliminar) — consumido por useDeleteCharacter.
  http.delete("/characters/:id", () => {
    return HttpResponse.json(
      {
        message: "DELETE /characters/:id sin handler configurado en este test",
      },
      { status: 501 },
    );
  }),
];
