import { z } from "zod";
import {
  buildTemplateSchema,
  flattenTemplateFields,
  FieldType,
  type FieldDefinition,
} from "@tpklabs/browchar-contracts";

import type { PlaybookView } from "@/lib/types";

/**
 * Schema y defaults del form de creación de personaje (DEV-50).
 *
 * DEV-153: la validación por-`FieldType` de `values` ya no se reimplementa a
 * mano acá — la provee `buildTemplateSchema` del paquete compartido
 * `@tpklabs/browchar-contracts` (fuente de verdad única FE/BE). Este archivo
 * solo aporta lo que es propio del form: el wrapper `{ name, values }`, los
 * valores por defecto y el tipo de react-hook-form.
 *
 * Se le pasa `coerceNumbers: true` porque react-hook-form entrega los inputs
 * numéricos como string; el builder los normaliza a `number`. Los mensajes de
 * error ahora vienen del paquete (el back es la fuente de verdad del wording).
 */

/** Forma del form en react-hook-form. `values` es dinámico (clave = `field.id`). */
export interface CharacterFormValues {
  name: string;
  values: Record<string, unknown>;
}

const NUMBER_TYPES = new Set<FieldType>([
  FieldType.TEXTNUMBER,
  FieldType.COUNTER,
  FieldType.PROGRESS,
]);

/** Todos los campos de un template, aplanando sus secciones. */
export function templateFields(
  playbook: PlaybookView | undefined,
): FieldDefinition[] {
  return flattenTemplateFields(playbook?.template ?? []);
}

/**
 * Construye el schema Zod del form para el playbook elegido. `name` siempre es
 * obligatorio; la validación de `values` sale de `buildTemplateSchema`. Sin
 * playbook, valida solo `name` (el `values` queda como objeto vacío válido).
 */
export function buildCharacterSchema(playbook: PlaybookView | undefined) {
  return z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    values: buildTemplateSchema(playbook?.template ?? [], {
      coerceNumbers: true,
    }),
  });
}

/** Valor inicial de un campo según su tipo y `defaultValue`. */
function defaultFieldValue(field: FieldDefinition): unknown {
  if (field.defaultValue !== undefined) {
    // Los numéricos viven como string en el input controlado.
    return NUMBER_TYPES.has(field.type)
      ? String(field.defaultValue)
      : field.defaultValue;
  }
  if (field.type === FieldType.CHECKBOX) return false;
  // Texto, numéricos y choices arrancan como string vacío.
  return "";
}

/**
 * Valores por defecto para inicializar/resetear react-hook-form cuando cambia
 * el playbook.
 */
export function buildDefaultValues(
  playbook: PlaybookView | undefined,
): CharacterFormValues {
  const values: Record<string, unknown> = {};
  for (const field of templateFields(playbook)) {
    values[field.id] = defaultFieldValue(field);
  }
  return { name: "", values };
}
