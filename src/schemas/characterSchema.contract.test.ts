import { describe, expect, it } from "vitest";
import {
  buildTemplateSchema,
  characterCreateFixtures,
  characterUpdateFixtures,
  contractTemplateFixture,
  createCharacterSchema,
  listCharactersQueryFixtures,
  listPlaybooksQueryFixtures,
  listCharactersQuerySchema,
  listPlaybooksQuerySchema,
  templateFormValuesFixtures,
  updateCharacterSchema,
} from "@tpklabs/browchar-contracts";
import type { InvalidFixture } from "@tpklabs/browchar-contracts";

import type { UpdateCharacterInput } from "@/hooks/useUpdateCharacter";
import type { PlaybookView } from "@/types";
import { buildCharacterSchema } from "./characterSchema";

/**
 * Contract tests del front (DEV-202).
 *
 * Consumen los MISMOS fixtures que valida la API (browchar-api ejercita sus
 * DTOs `createZodDto` contra ellos), importados desde el paquete PUBLICADO —
 * así que un contrato que cambie de un solo lado rompe acá aunque los tests
 * unitarios del front sigan verdes. Se prueba la capa real del front: el
 * schema del form (`buildCharacterSchema`, modo coerce) y la forma de los
 * payloads que arman los hooks de mutación.
 */

function expectContract(
  schema: { safeParse: (input: unknown) => { success: boolean } },
  fixtures: { valid: unknown[]; invalid: InvalidFixture[] },
) {
  for (const input of fixtures.valid) {
    expect(schema.safeParse(input).success).toBe(true);
  }
  for (const { reason, input } of fixtures.invalid) {
    expect({ reason, success: schema.safeParse(input).success }).toEqual({
      reason,
      success: false,
    });
  }
}

/** Playbook mínimo con el template de contrato, como lo entrega la API. */
const contractPlaybook = {
  template: contractTemplateFixture,
} as PlaybookView;

describe("contrato compartido: schemas de request (paquete publicado)", () => {
  it("createCharacterSchema acepta/rechaza los fixtures compartidos", () => {
    expectContract(createCharacterSchema, characterCreateFixtures);
  });

  it("updateCharacterSchema acepta/rechaza los fixtures compartidos", () => {
    expectContract(updateCharacterSchema, characterUpdateFixtures);
  });

  it("listCharactersQuerySchema acepta/rechaza los fixtures compartidos", () => {
    expectContract(listCharactersQuerySchema, listCharactersQueryFixtures);
  });

  it("listPlaybooksQuerySchema acepta/rechaza los fixtures compartidos", () => {
    expectContract(listPlaybooksQuerySchema, listPlaybooksQueryFixtures);
  });
});

describe("contrato del form: buildCharacterSchema contra el template de contrato", () => {
  const formSchema = buildCharacterSchema(contractPlaybook);

  it("acepta los values de form válidos (numéricos como string, coerce)", () => {
    for (const values of templateFormValuesFixtures.valid) {
      const result = formSchema.safeParse({ name: "Marlene", values });
      expect(result.success).toBe(true);
    }
  });

  it("rechaza los values de form inválidos apuntando al campo", () => {
    for (const { reason, path, input } of templateFormValuesFixtures.invalid) {
      const result = formSchema.safeParse({ name: "Marlene", values: input });
      expect({ reason, success: result.success }).toEqual({
        reason,
        success: false,
      });
      if (!result.success) {
        expect({ reason, path: result.error.issues[0]?.path }).toEqual({
          reason,
          path: ["values", path],
        });
      }
    }
  });
});

describe("contrato de los payloads de mutación", () => {
  it("el submit del form produce un payload de create válido para la API", () => {
    // Cadena completa: values en modo form (strings del input) -> parse del
    // form (coerciona) -> payload como lo arma useCreateCharacter -> el
    // schema de create Y la validación de values en modo API (la que corre
    // el back en el service) lo aceptan.
    const formSchema = buildCharacterSchema(contractPlaybook);
    const apiValuesSchema = buildTemplateSchema(contractTemplateFixture);

    for (const values of templateFormValuesFixtures.valid) {
      const parsed = formSchema.parse({ name: "Marlene", values });
      const payload = {
        name: parsed.name,
        playbookId: "contract-playbook",
        ownerId: "owner-1",
        values: parsed.values,
      };
      expect(createCharacterSchema.safeParse(payload).success).toBe(true);
      expect(apiValuesSchema.safeParse(parsed.values).success).toBe(true);
    }
  });

  it("el payload de useUpdateCharacter conforma updateCharacterSchema", () => {
    // useUpdateCharacter manda siempre { name, values } completos (el back
    // reemplaza values wholesale, DEV-67/68).
    const payload: UpdateCharacterInput = {
      name: "Marlene renombrada",
      values: { alias: "M", hp: 5, alignment: "good" },
    };
    expect(updateCharacterSchema.safeParse(payload).success).toBe(true);
  });
});
