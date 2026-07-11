import { z } from "zod";

import {
  FieldType,
  type FieldDefinition,
  type PlaybookView,
} from "@/lib/types";

/**
 * Schema dinámico del form de creación de personaje (DEV-50).
 *
 * El personaje no tiene campos fijos: se construye un schema Zod a partir del
 * `template` del Playbook elegido (`FieldDefinition[]`), mapeando cada
 * `FieldType` a su validación. Espeja `createCharacterSchema` del back
 * (browchar-api) en su forma (`name` + `values` por-campo); los mensajes son
 * un mirroreo aproximado en español — el back es la fuente de verdad para el
 * wording exacto (no se pudo inferir palabra por palabra desde los tipos, así
 * que se documenta acá en vez de adivinar).
 *
 * La integración real con la API va en otra subtask; acá solo validamos local.
 *
 * DEUDA (DEV-153): estas reglas por-`FieldType` son una reimplementación a mano
 * de la validación de template del back (`template-validation.ts`), con riesgo
 * de drift. Cuando se unifiquen los tipos/validación bajo una única fuente de
 * verdad (Prisma/Zod compartido), este builder debería derivarse de ahí en vez
 * de mantenerse acá. Ver los dos puntos marcados con `DEV-153` más abajo.
 */

/** Forma del form en react-hook-form. `values` es dinámico (clave = `field.id`). */
export interface CharacterFormValues {
  name: string;
  values: Record<string, unknown>;
}

const TEXT_TYPES = new Set([FieldType.TEXT, FieldType.TEXTAREA]);
const NUMBER_TYPES = new Set([
  FieldType.TEXTNUMBER,
  FieldType.COUNTER,
  FieldType.PROGRESS,
]);
const CHOICE_TYPES = new Set([FieldType.SELECT, FieldType.RADIO]);

function textFieldSchema(field: FieldDefinition): z.ZodTypeAny {
  if (field.required) {
    return z.string().trim().min(1, `${field.label} es obligatorio`);
  }
  return z.string();
}

function numberFieldSchema(field: FieldDefinition): z.ZodTypeAny {
  const requiredMsg = `${field.label} es obligatorio`;
  const numberMsg = `${field.label} debe ser un número`;

  let schema = z
    .number({
      // `error` como función permite distinguir "falta" de "no es número" y
      // delegar (undefined) los mensajes de min/max de abajo.
      error: (issue) => {
        if (issue.code === "invalid_type") {
          return issue.input === undefined ? requiredMsg : numberMsg;
        }
        return undefined;
      },
    })
    // DEV-153: `min(0)` se aplica también a TEXTNUMBER, que podría admitir
    // negativos (ej. un modificador). Es una regla local del FE; la definitiva
    // debe venir de la validación de template unificada con el back.
    .min(0, `${field.label} no puede ser negativo`);

  // maxValue solo aplica a COUNTER/PROGRESS (ver FieldDefinition).
  if (
    field.maxValue !== undefined &&
    (field.type === FieldType.COUNTER || field.type === FieldType.PROGRESS)
  ) {
    schema = schema.max(
      field.maxValue,
      `${field.label} no puede superar ${field.maxValue}`,
    );
  }

  // El input entrega string; normalizamos vacío -> undefined para que el campo
  // opcional pase y el requerido dispare el mensaje de "obligatorio".
  return z.preprocess(
    (value) => {
      if (value === "" || value === null || value === undefined) {
        return undefined;
      }
      if (typeof value === "number") return value;
      const parsed = Number(value);
      // Si no es número, se deja el valor original para que z.number() lo marque
      // como tipo inválido (numberMsg) en vez de un NaN silencioso.
      return Number.isNaN(parsed) ? value : parsed;
    },
    field.required ? schema : schema.optional(),
  );
}

function choiceFieldSchema(field: FieldDefinition): z.ZodTypeAny {
  const values = (field.options ?? []).map((option) => option.value);
  const withinOptions = (value: string) =>
    value === "" || values.includes(value);

  if (field.required) {
    return z
      .string()
      .min(1, `${field.label} es obligatorio`)
      .refine(withinOptions, `Elegí una opción válida para ${field.label}`);
  }
  return z
    .string()
    .refine(withinOptions, `Elegí una opción válida para ${field.label}`);
}

function checkboxFieldSchema(field: FieldDefinition): z.ZodTypeAny {
  if (field.required) {
    return z
      .boolean()
      .refine((value) => value === true, `${field.label} es obligatorio`);
  }
  return z.boolean();
}

function fieldSchema(field: FieldDefinition): z.ZodTypeAny {
  if (TEXT_TYPES.has(field.type)) return textFieldSchema(field);
  if (NUMBER_TYPES.has(field.type)) return numberFieldSchema(field);
  if (CHOICE_TYPES.has(field.type)) return choiceFieldSchema(field);
  if (field.type === FieldType.CHECKBOX) return checkboxFieldSchema(field);
  // Tipo desconocido: no validamos, aceptamos cualquier valor.
  return z.unknown();
}

/** Todos los campos de un template, aplanando sus secciones. */
export function templateFields(
  playbook: PlaybookView | undefined,
): FieldDefinition[] {
  return (playbook?.template ?? []).flatMap((section) => section.fields ?? []);
}

/**
 * Construye el schema Zod del form para el playbook elegido. `name` siempre
 * es obligatorio; el resto sale del `template`. Sin playbook, valida solo
 * `name`.
 */
export function buildCharacterSchema(playbook: PlaybookView | undefined) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of templateFields(playbook)) {
    // DEV-153: se validan también los campos `isReadOnly` (display-only); un
    // `isReadOnly` + `required` podría bloquear el submit sin forma de editarlo.
    // El tratamiento correcto debe venir de la fuente única, no adivinarse acá.
    shape[field.id] = fieldSchema(field);
  }

  return z.object({
    name: z.string().trim().min(1, "El nombre es obligatorio"),
    values: z.object(shape),
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
