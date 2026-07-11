/**
 * Tipos de dominio — Character.
 *
 * `Character` / `CharacterView` espejan `prisma/schemas/Character.prisma` de
 * browchar-api: son la forma de *respuesta* de la API (derivada de Prisma), que
 * el paquete compartido todavía no expone, así que se mantienen acá.
 *
 * DEV-153: los contratos de *request* (`CreateCharacterInput`,
 * `ListCharactersQuery`) y `ValidationError` ahora se derivan de los schemas Zod
 * de `@tpklabs/browchar-contracts` (fuente de verdad única FE/BE) — antes eran
 * copias a mano que podían driftear del back.
 *
 * Nota sobre fechas: `createdAt`/`updatedAt` llegan como string ISO 8601
 * (serialización JSON), no como `Date`.
 */
export type {
  CreateCharacterInput,
  ListCharactersQuery,
  ValidationError,
} from "@tpklabs/browchar-contracts";

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
