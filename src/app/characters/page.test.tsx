import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/characters/charactersList", () => ({
  CharactersList: () => <div>lista de personajes</div>,
}));

import CharactersPage from "./page";

describe("CharactersPage", () => {
  it("renders the heading and delegates the list to CharactersList", () => {
    render(<CharactersPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Personajes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("lista de personajes")).toBeInTheDocument();
  });

  it("links the CTA to the character creation route", () => {
    render(<CharactersPage />);
    expect(
      screen.getByRole("button", { name: "Crear personaje" }),
    ).toHaveAttribute("href", "/characters/new");
  });
});
