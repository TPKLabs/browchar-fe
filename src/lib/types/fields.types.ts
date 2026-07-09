/**
 * Tipos de dominio — Fields.
 *
 * Espejan `src/common/types/fields.types.ts` de browchar-api (DEV-20). Un
 * `FieldDefinition` describe un campo dentro del `template` de un Playbook; el
 * front los usa para renderizar el formulario dinámico de personaje
 * (`FieldType -> componente`).
 */

export enum FieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  TEXTNUMBER = "TEXTNUMBER",
  COUNTER = "COUNTER",
  PROGRESS = "PROGRESS",
  SELECT = "SELECT",
  CHECKBOX = "CHECKBOX",
  RADIO = "RADIO",
}

export interface FieldDefinition {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  type: FieldType;
  defaultValue?: string | number | boolean;
  /** Solo para COUNTER y PROGRESS. */
  maxValue?: number;
  disabled?: boolean;
  /** Campos de texto plano, como las Additional Rules. */
  isReadOnly?: boolean;
  /** Solo para SELECT, CHECKBOX, RADIO. */
  options?: { label: string; value: string }[];
}
