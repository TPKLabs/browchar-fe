import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { Game } from "@/lib/types";
import { GamesList } from "./games-list";

const GAMES: Game[] = [
  { id: "dnd5e", name: "D&D 5e" },
  { id: "pathfinder", name: "Pathfinder" },
];

function mockResponse(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("GamesList", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra un estado de carga mientras llega la respuesta", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderWithClient(<GamesList />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando juegos…");
  });

  it("renderiza cada juego y lo linkea a su página", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(200, GAMES)));

    renderWithClient(<GamesList />);

    expect(await screen.findByText("D&D 5e")).toBeInTheDocument();
    expect(screen.getByText("Pathfinder")).toBeInTheDocument();
    const actions = screen.getAllByRole("button", { name: "Ver playbooks" });
    expect(actions[0]).toHaveAttribute("href", "/games/dnd5e");
    expect(actions[1]).toHaveAttribute("href", "/games/pathfinder");
  });

  it("muestra un estado vacío cuando no hay juegos", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(200, [])));

    renderWithClient(<GamesList />);

    expect(
      await screen.findByText("No hay juegos disponibles todavía."),
    ).toBeInTheDocument();
  });

  it("muestra un error cuando la request falla (ej. endpoint aún no existe)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(404)));

    renderWithClient(<GamesList />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los juegos",
    );
  });
});
