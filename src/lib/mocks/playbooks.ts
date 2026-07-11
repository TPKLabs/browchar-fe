import { FieldType, type PlaybookView } from "@/lib/types";

/**
 * Playbooks mock (DEV-50).
 *
 * Placeholder hasta que exista el feature de Playbooks contra `GET /playbooks`
 * (la integración real con la API se hace en otra subtask). Se comparten entre
 * el listado (`/playbooks`) y el form de creación de personaje
 * (`/characters/new?playbookId=...`) para que ids y `template` sean
 * consistentes en todo el flujo.
 *
 * Los `template` cubren todos los `FieldType` para poder ejercitar el
 * renderizado dinámico del form (`FieldType -> control`).
 */
export const MOCK_PLAYBOOKS: PlaybookView[] = [
  {
    id: "guerrero",
    name: "Guerrero",
    version: 3,
    createdAt: "2026-01-15T12:00:00.000Z",
    description:
      "Combatiente cuerpo a cuerpo con foco en resistencia y daño físico.",
    game: { gameId: "dnd5e", gameName: "D&D 5e" },
    template: [
      {
        id: "atributos",
        title: "Atributos",
        description: "Valores base del personaje.",
        fields: [
          {
            id: "fuerza",
            label: "Fuerza",
            type: FieldType.TEXTNUMBER,
            required: true,
            defaultValue: 10,
          },
          {
            id: "destreza",
            label: "Destreza",
            type: FieldType.TEXTNUMBER,
            defaultValue: 10,
          },
        ],
      },
      {
        id: "estado",
        title: "Estado",
        fields: [
          {
            id: "pv",
            label: "Puntos de vida",
            description: "No pueden superar el máximo del playbook.",
            type: FieldType.PROGRESS,
            maxValue: 20,
            defaultValue: 20,
          },
          {
            id: "estres",
            label: "Estrés",
            type: FieldType.COUNTER,
            maxValue: 5,
            defaultValue: 0,
          },
        ],
      },
      {
        id: "descripcion",
        title: "Descripción",
        fields: [
          {
            id: "concepto",
            label: "Concepto",
            description: "Una frase que resuma al personaje.",
            type: FieldType.TEXT,
            required: true,
          },
          {
            id: "historia",
            label: "Historia",
            type: FieldType.TEXTAREA,
          },
        ],
      },
      {
        id: "opciones",
        title: "Opciones",
        fields: [
          {
            id: "alineamiento",
            label: "Alineamiento",
            type: FieldType.SELECT,
            required: true,
            options: [
              { label: "Legal bueno", value: "legal-bueno" },
              { label: "Neutral", value: "neutral" },
              { label: "Caótico malvado", value: "caotico-malvado" },
            ],
          },
          {
            id: "rol",
            label: "Rol en el grupo",
            type: FieldType.RADIO,
            defaultValue: "tanque",
            options: [
              { label: "Tanque", value: "tanque" },
              { label: "DPS", value: "dps" },
              { label: "Soporte", value: "soporte" },
            ],
          },
          {
            id: "inspirado",
            label: "Empieza inspirado",
            type: FieldType.CHECKBOX,
            defaultValue: false,
          },
        ],
      },
    ],
  },
  {
    id: "clerigo",
    name: "Clérigo",
    version: 2,
    createdAt: "2026-02-02T12:00:00.000Z",
    description: "Sanador y soporte con magia divina.",
    game: { gameId: "dnd5e", gameName: "D&D 5e" },
    template: [
      {
        id: "fe",
        title: "Fe",
        fields: [
          {
            id: "deidad",
            label: "Deidad",
            type: FieldType.TEXT,
            required: true,
          },
          {
            id: "dominio",
            label: "Dominio",
            type: FieldType.SELECT,
            required: true,
            options: [
              { label: "Vida", value: "vida" },
              { label: "Luz", value: "luz" },
              { label: "Guerra", value: "guerra" },
            ],
          },
          {
            id: "conjuros",
            label: "Espacios de conjuro",
            type: FieldType.PROGRESS,
            maxValue: 4,
            defaultValue: 4,
          },
        ],
      },
    ],
  },
  {
    id: "piromante",
    name: "Piromante",
    version: 1,
    createdAt: "2026-03-10T12:00:00.000Z",
    description: "Especialista en magia de fuego de área.",
    game: { gameId: "pathfinder", gameName: "Pathfinder" },
    template: [
      {
        id: "arcano",
        title: "Arcano",
        fields: [
          {
            id: "escuela",
            label: "Escuela mágica",
            type: FieldType.RADIO,
            required: true,
            options: [
              { label: "Evocación", value: "evocacion" },
              { label: "Conjuración", value: "conjuracion" },
            ],
          },
          {
            id: "sobrecarga",
            label: "Sobrecarga",
            type: FieldType.COUNTER,
            maxValue: 3,
            defaultValue: 0,
          },
          {
            id: "notas",
            label: "Notas",
            type: FieldType.TEXTAREA,
          },
        ],
      },
    ],
  },
];

/** Busca un playbook mock por id. Devuelve `undefined` si no existe. */
export function getMockPlaybook(
  id: string | undefined,
): PlaybookView | undefined {
  if (!id) return undefined;
  return MOCK_PLAYBOOKS.find((playbook) => playbook.id === id);
}
