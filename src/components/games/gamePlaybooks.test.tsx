import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { FieldType, type Game, type PlaybookView } from "@/types";
import { GamePlaybooks } from "./gamePlaybooks";

const GAMES: Game[] = [
  { id: "dnd5e", name: "D&D 5e" },
  { id: "pathfinder", name: "Pathfinder" },
];

const PLAYBOOKS: PlaybookView[] = [
  {
    id: "guerrero",
    name: "Guerrero",
    version: 1,
    createdAt: "2026-01-15T12:00:00.000Z",
    description: "Combatiente.",
    game: { gameId: "dnd5e", gameName: "D&D 5e" },
    template: [
      { id: "s", fields: [{ id: "f", label: "F", type: FieldType.TEXT }] },
    ],
  },
];

function mockGamesAndPlaybooks() {
  server.use(
    http.get("/games", () => HttpResponse.json(GAMES)),
    http.get("/playbooks", () => HttpResponse.json(PLAYBOOKS)),
  );
}

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("GamePlaybooks", () => {
  it("muestra el nombre del juego y sus playbooks", async () => {
    mockGamesAndPlaybooks();

    renderWithClient(<GamePlaybooks gameId="dnd5e" />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "D&D 5e" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Guerrero")).toBeInTheDocument();
  });

  it("pide los playbooks filtrados por ese gameId", async () => {
    let receivedSearch: string | undefined;
    server.use(
      http.get("/games", () => HttpResponse.json(GAMES)),
      http.get("/playbooks", ({ request }) => {
        receivedSearch = new URL(request.url).search;
        return HttpResponse.json(PLAYBOOKS);
      }),
    );

    renderWithClient(<GamePlaybooks gameId="dnd5e" />);

    await screen.findByText("Guerrero");
    expect(receivedSearch).toBe("?gameId=dnd5e");
  });

  it("tiene un link de vuelta al listado de juegos", async () => {
    mockGamesAndPlaybooks();

    renderWithClient(<GamePlaybooks gameId="dnd5e" />);

    expect(
      await screen.findByRole("button", { name: /juegos/i }),
    ).toHaveAttribute("href", "/games");
  });
});
