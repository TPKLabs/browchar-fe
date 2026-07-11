/**
 * Tipos de dominio — Template.
 *
 * DEV-153: la forma del `template` de un Playbook vive en el paquete compartido
 * `@tpklabs/browchar-contracts` (fuente de verdad única FE/BE). Se re-exporta
 * desde acá para no romper los imports internos (`@/lib/types`).
 */
export type { TemplateSection, Template } from "@tpklabs/browchar-contracts";
