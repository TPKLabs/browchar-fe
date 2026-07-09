import type { FieldDefinition } from "./fields.types";

/**
 * Espejan `src/common/types/template.types.ts` de browchar-api (DEV-20).
 *
 * El `template` de un Playbook (JSON en la DB) se serializa como
 * `TemplateSection[]` — así lo consume el template validator del back
 * (`template-validation.ts`) y así llega en `Playbook.template` por la API.
 */
export interface TemplateSection {
  id: string;
  title?: string;
  description?: string;
  fields?: FieldDefinition[];
}
