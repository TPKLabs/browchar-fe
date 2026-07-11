/**
 * Tipos de dominio — Fields.
 *
 * DEV-153: la forma de un `FieldDefinition` ahora vive en el paquete compartido
 * `@tpklabs/browchar-contracts` (fuente de verdad única FE/BE), no en una copia
 * a mano. Se re-exporta desde acá para no romper los imports internos
 * (`@/lib/types`). El front los usa para renderizar el formulario dinámico de
 * personaje (`FieldType -> componente`).
 */
export { FieldType } from "@tpklabs/browchar-contracts";
export type { FieldDefinition, FieldOption } from "@tpklabs/browchar-contracts";
