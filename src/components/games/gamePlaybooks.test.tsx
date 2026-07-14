import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

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

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

/** Router de fetch por URL: /games -> juegos, /playbooks?gameId= -> playbooks. */
function stubApi() {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.startsWith("/games")) return Promise.resolve(jsonResponse(GAMES));
      if (url.startsWith("/playbooks"))
        return Promise.resolve(jsonResponse(PLAYBOOKS));
      throw new Error(`URL no esperada: ${url}`);
    }),
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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra el nombre del juego y sus playbooks", async () => {
    stubApi();

    renderWithClient(<GamePlaybooks gameId="dnd5e" />);

    expect(
      await screen.findByRole("heading", { level: 1, name: "D&D 5e" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Guerrero")).toBeInTheDocument();
  });

  it("pide los playbooks filtrados por ese gameId", async () => {
    stubApi();

    renderWithClient(<GamePlaybooks gameId="dnd5e" />);

    await screen.findByText("Guerrero");
    const fetchMock = fetch as unknown as ReturnType<typeof vi.fn>;
    const calledUrls = fetchMock.mock.calls.map((c) => c[0] as string);
    expect(calledUrls).toContain("/playbooks?gameId=dnd5e");
  });

  it("tiene un link de vuelta al listado de juegos", async () => {
    stubApi();

    renderWithClient(<GamePlaybooks gameId="dnd5e" />);

    expect(
      await screen.findByRole("button", { name: /juegos/i }),
    ).toHaveAttribute("href", "/games");
  });
});
