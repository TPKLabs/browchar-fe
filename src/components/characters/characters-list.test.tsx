import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { CharacterSummary } from "@/lib/types";
import { CharactersList } from "./characters-list";

const CHARACTERS: CharacterSummary[] = [
  {
    id: "char_1",
    name: "Mad Dog",
    playbookName: "Motorista",
    gameName: "Apocalypse World",
    campaignName: "Ruinas de Neo Tokio",
    createdAt: "2026-04-01T09:30:00.000Z",
    updatedAt: "2026-04-28T18:00:00.000Z",
  },
  {
    id: "char_2",
    name: "Silent Star",
    playbookName: "Ángel",
    gameName: "Apocalypse World",
    createdAt: "2026-04-15T10:00:00.000Z",
    updatedAt: "2026-04-15T10:00:00.000Z",
  },
];

describe("CharactersList", () => {
  it("muestra un estado de carga", () => {
    render(<CharactersList characters={[]} isPending isError={false} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando personajes…",
    );
  });

  it("muestra un error", () => {
    render(<CharactersList characters={[]} isPending={false} isError />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los personajes",
    );
  });

  it("muestra un estado vacío cuando no hay personajes", () => {
    render(
      <CharactersList characters={[]} isPending={false} isError={false} />,
    );
    expect(
      screen.getByText("Todavía no creaste ningún personaje."),
    ).toBeInTheDocument();
  });

  it("renderiza cada personaje", () => {
    render(
      <CharactersList
        characters={CHARACTERS}
        isPending={false}
        isError={false}
      />,
    );
    expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    expect(screen.getByText("Silent Star")).toBeInTheDocument();
  });
});
