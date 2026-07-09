/**
 * Barrel de tipos de dominio (DEV-20).
 *
 * Espejan la forma de los datos de browchar-api (Prisma models + schemas Zod
 * de request), recortada a lo que el front necesita:
 * - `fields.types` / `template.types`: forma del `template` de un Playbook,
 *   usados por el motor de form dinámico.
 * - `playbook.types` / `character.types`: entidades de dominio + contratos de
 *   request de sus endpoints.
 * - `pagination.types`: envelope `data`/`meta` compartido por endpoints
 *   paginados.
 *
 * Import recomendado: `import type { Character, Playbook } from '@/lib/types'`.
 */

export * from "./fields.types";
export * from "./template.types";
export * from "./playbook.types";
export * from "./character.types";
export * from "./pagination.types";
