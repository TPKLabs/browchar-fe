import { http, HttpResponse } from "msw";
import type { Game } from "@/types";

/** Handler base de Games (DEV-200). Ver nota de defaults en `characters.ts`. */
export const gamesHandlers = [
  http.get("/games", () => {
    const body: Game[] = [];
    return HttpResponse.json(body);
  }),
];
