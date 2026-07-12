import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/games/games-list", () => ({
  GamesList: () => <div>lista de juegos</div>,
}));

import GamesPage from "./page";

describe("GamesPage", () => {
  it("renders the heading and delegates the list to GamesList", () => {
    render(<GamesPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Juegos" }),
    ).toBeInTheDocument();
    expect(screen.getByText("lista de juegos")).toBeInTheDocument();
  });
});
