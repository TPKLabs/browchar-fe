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

/** Vista de Character expuesta por `POST /characters` y `GET /characters/:id` (fila cruda). */
export type CharacterView = Character;

/**
 * Item del listado `GET /characters`: espejo de `CharacterListItem` en
 * browchar-api. Es el `Character` crudo enriquecido con los nombres resueltos
 * de su Playbook y su Game (DEV-60), así el front arma las tarjetas sin cruzar
 * `usePlaybooks` a mano. `campaignName` todavía no se resuelve en la API.
 */
export interface CharacterListItem extends Character {
  playbookName: string;
  gameName: string;
}

/**
 * Vista resumida de un Character para tarjetas de listado (home "Tus
 * personajes recientes" y `/characters`, DEV-56): nombre, Playbook (hace de
 * "raza/clase"), Game y, si el personaje está en alguna, Campaign.
 *
 * Denormalizada a propósito: `GET /characters` hoy devuelve la fila cruda de
 * Character (ver `characters.service.ts` en browchar-api), sin el Playbook,
 * Game ni Campaign resueltos. Hasta que el back los una en la respuesta (o el
 * front los cruce con `usePlaybooks`/`useGames`), estas vistas se arman a
 * mano con datos de ejemplo.
 */
export interface CharacterSummary {
  id: string;
  name: string;
  playbookName: string;
  gameName: string;
  /** Ausente si el personaje no participa de ninguna Campaign. */
  campaignName?: string;
  /** ISO 8601, igual que `Character.createdAt`/`updatedAt`. */
  createdAt: string;
  updatedAt: string;
}
