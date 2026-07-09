/**
 * Espejan `prisma/schemas/Character.prisma` + `src/common/types/character.types.ts`
 * y los schemas Zod de `src/characters/character.schemas.ts` en browchar-api
 * (DEV-20).
 *
 * Nota sobre fechas: igual que en `playbook.types.ts`, `createdAt`/`updatedAt`
 * llegan como string ISO 8601 (serialización JSON), no como `Date`.
 */
export interface Character {
  id: string;
  name: string;
  ownerId: string;
  /** Forma dinámica definida por el `template` del Playbook (DEV-48). */
  values: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  playbookId: string;
  playbookVersion: number;
}

/** Vista de Character expuesta por `GET /characters` y `GET /characters/:id`. */
export type CharacterView = Character;

/**
 * Error de validación de un campo de `values` contra el template, o de un
 * campo del request (Zod). Forma de cada item de `errors` en las respuestas
 * 400 del back.
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Espejo de `createCharacterSchema` (back). El front debe construir su propio
 * schema Zod equivalente para validar el form antes de enviar (mismos
 * mensajes que el back) — este type es el contrato mínimo que el body debe
 * cumplir.
 */
export interface CreateCharacterInput {
  name: string;
  playbookId: string;
  /** Sin auth todavía (DEV-5): viaja en el body en modo dev. */
  ownerId: string;
  values?: Record<string, unknown>;
}

/**
 * Espejo de `listCharactersQuerySchema` (back). `page`/`pageSize` viajan como
 * query params string sobre HTTP; acá se tipan ya coercionados a number para
 * que el cliente API los use antes de serializar la URL.
 */
export interface ListCharactersQuery {
  playbookId?: string;
  gameId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}
