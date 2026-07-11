import { describe, expect, it } from "vitest";

import { FieldType, type PlaybookView } from "@/lib/types";
import { buildCharacterSchema, buildDefaultValues } from "./character-schema";

function playbookWith(
  fields: PlaybookView["template"][number]["fields"],
): PlaybookView {
  return {
    id: "pb",
    name: "Test",
    version: 1,
    createdAt: "2026-01-01T00:00:00.000Z",
    game: { gameId: "g", gameName: "Game" },
    template: [{ id: "s", fields }],
  };
}

describe("buildCharacterSchema", () => {
  it("requires name even without a playbook", () => {
    const schema = buildCharacterSchema(undefined);
    expect(schema.safeParse({ name: "", values: {} }).success).toBe(false);
    expect(schema.safeParse({ name: "Aria", values: {} }).success).toBe(true);
  });

  it("accepts a fully valid dynamic payload", () => {
    const schema = buildCharacterSchema(
      playbookWith([
        {
          id: "concepto",
          label: "Concepto",
          type: FieldType.TEXT,
          required: true,
        },
        {
          id: "fuerza",
          label: "Fuerza",
          type: FieldType.TEXTNUMBER,
          required: true,
        },
        { id: "pv", label: "PV", type: FieldType.PROGRESS, maxValue: 10 },
        {
          id: "clase",
          label: "Clase",
          type: FieldType.SELECT,
          required: true,
          options: [{ label: "A", value: "a" }],
        },
        { id: "insp", label: "Inspirado", type: FieldType.CHECKBOX },
      ]),
    );
    const result = schema.safeParse({
      name: "Aria",
      values: {
        concepto: "Heroína",
        fuerza: "12",
        pv: "8",
        clase: "a",
        insp: false,
      },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.values.fuerza).toBe(12);
      expect(result.data.values.pv).toBe(8);
    }
  });

  it("flags a required text field when empty", () => {
    const schema = buildCharacterSchema(
      playbookWith([
        {
          id: "concepto",
          label: "Concepto",
          type: FieldType.TEXT,
          required: true,
        },
      ]),
    );
    // La fuente única (back) valida `min(1)` sin `.trim()`: un string vacío se
    // rechaza. (El trim de whitespace-only es un gap heredado del back — ver
    // CHANGELOG Future Considerations de DEV-153.)
    const result = schema.safeParse({
      name: "Aria",
      values: { concepto: "" },
    });
    expect(result.success).toBe(false);
  });

  it("allows negative numeric values (no min(0))", () => {
    // DEV-153: el `.min(0)` local del FE se eliminó — un modificador negativo
    // es válido, alineado con la validación de template del back.
    const schema = buildCharacterSchema(
      playbookWith([
        { id: "mod", label: "Modificador", type: FieldType.TEXTNUMBER },
      ]),
    );
    expect(schema.safeParse({ name: "A", values: { mod: "-2" } }).success).toBe(
      true,
    );
  });

  it("enforces maxValue on COUNTER/PROGRESS", () => {
    const schema = buildCharacterSchema(
      playbookWith([
        { id: "pv", label: "PV", type: FieldType.PROGRESS, maxValue: 10 },
      ]),
    );
    expect(schema.safeParse({ name: "A", values: { pv: "11" } }).success).toBe(
      false,
    );
    expect(schema.safeParse({ name: "A", values: { pv: "10" } }).success).toBe(
      true,
    );
  });

  it("rejects non-numeric input on numeric fields", () => {
    const schema = buildCharacterSchema(
      playbookWith([
        {
          id: "fuerza",
          label: "Fuerza",
          type: FieldType.TEXTNUMBER,
          required: true,
        },
      ]),
    );
    expect(
      schema.safeParse({ name: "A", values: { fuerza: "abc" } }).success,
    ).toBe(false);
  });

  it("allows an empty optional numeric field", () => {
    const schema = buildCharacterSchema(
      playbookWith([
        { id: "destreza", label: "Destreza", type: FieldType.TEXTNUMBER },
      ]),
    );
    expect(
      schema.safeParse({ name: "A", values: { destreza: "" } }).success,
    ).toBe(true);
  });

  it("rejects a choice value outside its options", () => {
    const schema = buildCharacterSchema(
      playbookWith([
        {
          id: "clase",
          label: "Clase",
          type: FieldType.SELECT,
          required: true,
          options: [{ label: "A", value: "a" }],
        },
      ]),
    );
    expect(
      schema.safeParse({ name: "A", values: { clase: "z" } }).success,
    ).toBe(false);
    expect(schema.safeParse({ name: "A", values: { clase: "" } }).success).toBe(
      false,
    );
    expect(
      schema.safeParse({ name: "A", values: { clase: "a" } }).success,
    ).toBe(true);
  });

  it("accepts a required checkbox whether checked or not", () => {
    // DEV-153: en la fuente única (back), un checkbox `required` sin `options`
    // sólo debe ser booleano — `false` es válido (los checkboxes del dominio son
    // toggles/condiciones, no consentimientos "debe estar tildado").
    const schema = buildCharacterSchema(
      playbookWith([
        {
          id: "terms",
          label: "Acepto",
          type: FieldType.CHECKBOX,
          required: true,
        },
      ]),
    );
    expect(
      schema.safeParse({ name: "A", values: { terms: false } }).success,
    ).toBe(true);
    expect(
      schema.safeParse({ name: "A", values: { terms: true } }).success,
    ).toBe(true);
  });
});

describe("buildDefaultValues", () => {
  it("returns empty name and no values without a playbook", () => {
    expect(buildDefaultValues(undefined)).toEqual({ name: "", values: {} });
  });

  it("derives per-field defaults from the template", () => {
    const defaults = buildDefaultValues(
      playbookWith([
        { id: "concepto", label: "Concepto", type: FieldType.TEXT },
        {
          id: "fuerza",
          label: "Fuerza",
          type: FieldType.TEXTNUMBER,
          defaultValue: 10,
        },
        { id: "insp", label: "Inspirado", type: FieldType.CHECKBOX },
        {
          id: "rol",
          label: "Rol",
          type: FieldType.RADIO,
          defaultValue: "tanque",
          options: [{ label: "Tanque", value: "tanque" }],
        },
      ]),
    );
    expect(defaults).toEqual({
      name: "",
      values: { concepto: "", fuerza: "10", insp: false, rol: "tanque" },
    });
  });
});
