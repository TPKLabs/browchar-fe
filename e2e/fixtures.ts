import {
  FieldType,
  type Character,
  type CharacterListItem,
  type PlaybookGetResponse,
} from "@tpklabs/browchar-contracts";

/**
 * Datos compartidos por los specs E2E (DEV-199). Un playbook mínimo con un
 * único campo TEXT requerido — alcanza para ejercitar el form dinámico sin
 * acoplarse a un template real de `data/playbooks/*` (que vive en
 * browchar-api, otro repo).
 *
 * Importa directo de `@tpklabs/browchar-contracts` (no del barrel de
 * compatibilidad `@/types`) y valida cada fixture contra el tipo wire real
 * con `satisfies` (DEV-197): si el contrato le agrega/renombra un campo, esto
 * deja de compilar en vez de que el mock se desalinee del backend en
 * silencio.
 */
export const PLAYBOOK = {
  id: "guerrero",
  name: "Guerrero",
  version: 3,
  createdAt: "2026-01-15T12:00:00.000Z",
  game: { gameId: "dnd5e", gameName: "D&D 5e" },
  template: [
    {
      id: "sec",
      title: "Sección",
      fields: [
        {
          id: "concepto",
          label: "Concepto",
          type: FieldType.TEXT,
          required: true,
        },
      ],
    },
  ],
} satisfies PlaybookGetResponse;

export const CHARACTER = {
  id: "char_1",
  name: "Aria",
  ownerId: "usr_demo",
  playbookId: PLAYBOOK.id,
  playbookVersion: PLAYBOOK.version,
  values: { concepto: "Una guerrera errante" },
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-15T12:00:00.000Z",
  deletedAt: null,
} satisfies Character;

export const CHARACTER_LIST_ITEM = {
  ...CHARACTER,
  playbookName: PLAYBOOK.name,
  gameName: PLAYBOOK.game.gameName,
} satisfies CharacterListItem;
