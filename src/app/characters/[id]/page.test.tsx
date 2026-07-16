import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/characters/characterDetailContainer", () => ({
  CharacterDetailContainer: ({ characterId }: { characterId: string }) => (
    <div>detalle del personaje {characterId}</div>
  ),
}));

import CharacterDetailPage from "./page";

describe("CharacterDetailPage", () => {
  it("pasa el id del route param al container", async () => {
    // Async Server Component sin hijos async: se invoca como función y se
    // renderiza el resultado (mismo patrón que /games/[gameId]).
    const ui = await CharacterDetailPage({
      params: Promise.resolve({ id: "char_1" }),
    });
    render(ui);

    expect(
      screen.getByText("detalle del personaje char_1"),
    ).toBeInTheDocument();
  });
});
