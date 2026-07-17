/**
 * Tipos de dominio — Playbook.
 *
 * DEV-197: los wire shapes viven en `@tpklabs/browchar-contracts` (ver la
 * nota sobre `template` y fechas ISO ahí). Re-exports por compatibilidad de
 * imports (`@/types`); código nuevo usa los nombres por endpoint
 * (`PlaybookListResponse`, `PlaybookGetResponse`) directo del paquete.
 */
export type {
  Playbook,
  PlaybookView,
  PlaybookListRequestParams,
  PlaybookListResponse,
  PlaybookGetResponse,
} from "@tpklabs/browchar-contracts";
