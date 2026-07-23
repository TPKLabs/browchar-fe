import { http, HttpResponse } from "msw";

/** Handlers base de Playbooks (DEV-200). Ver nota de defaults en `characters.ts`. */
export const playbooksHandlers = [
  http.get("/playbooks", () => {
    return HttpResponse.json(
      { message: "GET /playbooks sin handler configurado en este test" },
      { status: 501 },
    );
  }),

  http.get("/playbooks/:id", ({ params }) => {
    return HttpResponse.json(
      { message: `Playbook ${String(params.id)} no encontrado` },
      { status: 404 },
    );
  }),
];
