/**
 * DEV-197: el envelope de paginación y sus defaults viven en
 * `@tpklabs/browchar-contracts` (una sola definición FE/BE). Re-exports por
 * compatibilidad de imports (`@/types`).
 */
export { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@tpklabs/browchar-contracts";
export type { Paginated, PaginationMeta } from "@tpklabs/browchar-contracts";
