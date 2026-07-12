import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { FieldType, type PlaybookView } from "@/lib/types";
import { PlaybookCard } from "./playbook-card";

const PLAYBOOK: PlaybookView = {
  id: "guerrero",
  name: "Guerrero",
  version: 3,
  createdAt: "2026-01-15T12:00:00.000Z",
  description: "Combatiente cuerpo a cuerpo.",
  game: { gameId: "dnd5e", gameName: "D&D 5e" },
  template: [
    { id: "sec", fields: [{ id: "f", label: "F", type: FieldType.TEXT }] },
  ],
};

describe("PlaybookCard", () => {
  it("muestra nombre, juego y versión", () => {
    render(<PlaybookCard playbook={PLAYBOOK} />);
    expect(screen.getByText("Guerrero")).toBeInTheDocument();
    expect(screen.getByText("D&D 5e")).toBeInTheDocument();
    expect(screen.getByText("v3")).toBeInTheDocument();
  });

  it("linkea al form de creación con su id", () => {
    render(<PlaybookCard playbook={PLAYBOOK} />);
    expect(
      screen.getByRole("button", { name: "Crear personaje" }),
    ).toHaveAttribute("href", "/characters/new?playbookId=guerrero");
  });
});
