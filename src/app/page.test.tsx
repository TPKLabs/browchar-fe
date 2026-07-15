import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/characters/recentCharacters", () => ({
  RecentCharacters: () => <div>personajes recientes</div>,
}));

import Home from "./page";

describe("Home", () => {
  it("renders the dashboard welcome heading", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Bienvenido de nuevo, aventurero",
      }),
    ).toBeInTheDocument();
  });

  it("links the quick actions to character creation and the games page", () => {
    render(<Home />);
    expect(
      screen.getByRole("button", { name: /crear personaje/i }),
    ).toHaveAttribute("href", "/characters/new");
    expect(screen.getByRole("button", { name: /ver juegos/i })).toHaveAttribute(
      "href",
      "/games",
    );
  });

  it("delegates the recent characters to RecentCharacters", () => {
    render(<Home />);
    expect(screen.getByText("personajes recientes")).toBeInTheDocument();
  });

  it("links to the full characters list", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /ver todos/i })).toHaveAttribute(
      "href",
      "/characters",
    );
  });
});
