/**
 * Espejan `src/common/pagination.ts` + el envelope `Paginated` de
 * `src/common/types/character.types.ts` en browchar-api (DEV-20).
 *
 * Éstos no son específicos de Characters: cualquier endpoint paginado futuro
 * (Campaigns, etc.) responde con este mismo envelope `data`/`meta`.
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 20;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}
