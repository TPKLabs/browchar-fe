import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/games/game-playbooks", () => ({
  GamePlaybooks: ({ gameId }: { gameId: string }) => (
    <div>playbooks del juego {gameId}</div>
  ),
}));

import GamePage from "./page";

describe("GamePage", () => {
  it("pasa el gameId del route param al componente", async () => {
    // Async Server Component sin hijos async: se invoca como función y se
    // renderiza el resultado (mismo patrón que /characters/new).
    const ui = await GamePage({
      params: Promise.resolve({ gameId: "dnd5e" }),
    });
    render(ui);

    expect(screen.getByText("playbooks del juego dnd5e")).toBeInTheDocument();
  });
});
