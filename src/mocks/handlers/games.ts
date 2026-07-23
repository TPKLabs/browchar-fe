import { http, HttpResponse } from "msw";

/** Handler base de Games (DEV-200). Ver nota de defaults en `characters.ts`. */
export const gamesHandlers = [
  http.get("/games", () => {
    return HttpResponse.json(
      { message: "GET /games sin handler configurado en este test" },
      { status: 501 },
    );
  }),
];
