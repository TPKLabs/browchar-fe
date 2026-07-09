import type { TemplateSection } from "./template.types";

/**
 * Espejan `prisma/schemas/Playbook.prisma` + `src/common/types/playbook.types.ts`
 * de browchar-api (DEV-20).
 *
 * Nota sobre `template`: en la DB es una columna `Json`, pero el back siempre
 * la puebla con la forma `TemplateSection[]` (ver `template-validation.ts`).
 * La tipamos así en el front porque es la forma real con la que hay que
 * renderizar el form dinámico — no como `unknown`.
 *
 * Nota sobre fechas: la API serializa `DateTime` como string ISO 8601 sobre
 * HTTP (JSON no tiene tipo Date), por eso `createdAt` es `string`, no `Date`.
 */
export interface Playbook {
  id: string;
  gameId: string;
  name: string;
  version: number;
  createdAt: string;
  description?: string | null;
  template: TemplateSection[];
}

/**
 * Vista de Playbook expuesta por `GET /playbooks` y `GET /playbooks/:id`:
 * el back reemplaza `gameId` por el objeto `game` (id + nombre resueltos).
 */
export interface PlaybookView extends Omit<Playbook, "gameId"> {
  game: {
    gameId: string;
    gameName: string;
  };
}
