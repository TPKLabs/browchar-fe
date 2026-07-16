import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import type { CharacterSummary } from "@/types";
import { CharacterCard } from "./characterCard";

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
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T18:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

  it("muestra la fecha de creación absoluta y el tiempo relativo desde la última edición", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByText(/Creado el/)).toHaveTextContent(
      "Creado el 1 de abr de 2026",
    );
    const lastEdited = screen.getByText(/Última edición/);
    expect(lastEdited).toHaveTextContent("Última edición hace 3 días");
    expect(lastEdited).toHaveAttribute("title", "28 de abr de 2026");
  });

  it("linkea al detalle del personaje", () => {
    render(<CharacterCard character={CHARACTER} />);
    expect(screen.getByRole("button", { name: "Ver detalle" })).toHaveAttribute(
      "href",
      "/characters/char_1",
    );
  });

  describe("eliminar", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("pide confirmación y oculta la card si se confirma", () => {
      vi.spyOn(window, "confirm").mockReturnValue(true);
      render(<CharacterCard character={CHARACTER} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar personaje" }),
      );

      expect(window.confirm).toHaveBeenCalledWith("¿Eliminar a Mad Dog?");
      expect(screen.queryByText("Mad Dog")).not.toBeInTheDocument();
    });

    it("no oculta la card si se cancela la confirmación", () => {
      vi.spyOn(window, "confirm").mockReturnValue(false);
      render(<CharacterCard character={CHARACTER} />);

      fireEvent.click(
        screen.getByRole("button", { name: "Eliminar personaje" }),
      );

      expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    });
  });
});
