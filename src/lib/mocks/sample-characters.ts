import type { CharacterSummary } from "@/lib/types";

/**
 * Datos de ejemplo compartidos entre la home ("Tus personajes recientes") y
 * `/characters` (DEV-56), para que ambas pantallas muestren siempre los
 * mismos personajes en vez de dos listas divergentes. Ordenados por
 * `updatedAt` desc (el más recientemente editado primero); la home toma los
 * primeros N como "recientes", `/characters` los muestra todos.
 *
 * Se reemplaza por datos reales cuando se resuelva la integración con
 * `GET /characters` (DEV-60) y la fuente de Playbook/Game/Campaign resueltos.
 */
export const SAMPLE_CHARACTERS: CharacterSummary[] = [
  {
    id: "char_1",
    name: "Kaelith Duskbane",
    playbookName: "Guerrero",
    gameName: "D&D 5e",
    campaignName: "La Caída de Baldur's Gate",
    createdAt: "2026-01-15T12:00:00.000Z",
    updatedAt: "2026-07-10T08:00:00.000Z",
  },
  {
    id: "char_2",
    name: "Voss Ironhollow",
    playbookName: "Clérigo",
    gameName: "D&D 5e",
    createdAt: "2026-02-02T12:00:00.000Z",
    updatedAt: "2026-06-20T15:00:00.000Z",
  },
  {
    id: "char_3",
    name: "Nyra Emberfall",
    playbookName: "Piromante",
    gameName: "Pathfinder",
    createdAt: "2026-03-10T12:00:00.000Z",
    updatedAt: "2026-05-01T09:00:00.000Z",
  },
  {
    id: "char_4",
    name: "Mad Dog",
    playbookName: "Motorista",
    gameName: "Apocalypse World",
    campaignName: "Ruinas de Neo Tokio",
    createdAt: "2026-04-01T09:30:00.000Z",
    updatedAt: "2026-04-28T18:00:00.000Z",
  },
  {
    id: "char_5",
    name: "Silent Star",
    playbookName: "Ángel",
    gameName: "Apocalypse World",
    createdAt: "2026-04-15T10:00:00.000Z",
    updatedAt: "2026-04-15T10:00:00.000Z",
  },
];
