import { charactersHandlers } from "./characters";
import { playbooksHandlers } from "./playbooks";
import { gamesHandlers } from "./games";

/** Handlers base de MSW (DEV-200): uno por endpoint consumido por el front. */
export const handlers = [
  ...charactersHandlers,
  ...playbooksHandlers,
  ...gamesHandlers,
];
