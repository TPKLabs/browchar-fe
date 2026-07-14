import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { CharacterSummary } from "@/lib/types";
import { CharacterCard } from "./character-card";

const CHARACTER: CharacterSummary = {
  id: "char_1",
  name: "Mad Dog",
  playbookName: "Motorista",
  gameName: "Apocalypse World",
  campaignName: "Ruinas de Neo Tokio",
  createdAt: "2026-04-01T09:30:00.000Z",
  updatedAt: "2026-04-28T18:00:00.000Z",
};

describe("CharacterCard", () => {
  it("muestra el nombre y el playbook del personaje", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    expect(screen.getByText("Motorista")).toBeInTheDocument();
  });

  it("muestra el juego y la campaña cuando corresponde", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText("Apocalypse World")).toBeInTheDocument();
    expect(screen.getByText("Ruinas de Neo Tokio")).toBeInTheDocument();
  });

  it("no muestra badge de campaña cuando el personaje no tiene una", () => {
    render(
      <CharacterCard character={{ ...CHARACTER, campaignName: undefined }} />,
    );
    expect(screen.queryByText("Ruinas de Neo Tokio")).not.toBeInTheDocument();
  });

  it("ubica los chips de juego y campaña antes del nombre", () => {
    const { container } = render(<CharacterCard character={CHARACTER} />);
    const html = container.innerHTML;
    expect(html.indexOf("Apocalypse World")).toBeLessThan(
      html.indexOf("Mad Dog"),
    );
    expect(html.indexOf("Ruinas de Neo Tokio")).toBeLessThan(
      html.indexOf("Mad Dog"),
    );
  });

  it("muestra la fecha de creación y de última edición", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText(/Creado el/)).toHaveTextContent("2026");
    expect(screen.getByText(/Última edición el/)).toHaveTextContent("2026");
  });

  it("linkea al detalle del personaje", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByRole("button", { name: "Ver detalle" })).toHaveAttribute(
      "href",
      "/characters/char_1",
    );
  });
});
