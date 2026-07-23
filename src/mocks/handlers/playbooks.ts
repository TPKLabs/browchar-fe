import { http, HttpResponse } from "msw";
import type { PlaybookView } from "@/types";

/** Handlers base de Playbooks (DEV-200). Ver nota de defaults en `characters.ts`. */
export const playbooksHandlers = [
  http.get("/playbooks", () => {
    const body: PlaybookView[] = [];
    return HttpResponse.json(body);
  }),

  http.get("/playbooks/:id", ({ params }) => {
    return HttpResponse.json(
      { message: `Playbook ${String(params.id)} no encontrado` },
      { status: 404 },
    );
  }),
];
