import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import type { Game } from "@/types";
import { GamesList } from "./gamesList";

const GAMES: Game[] = [
  { id: "dnd5e", name: "D&D 5e" },
  { id: "pathfinder", name: "Pathfinder" },
];

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("GamesList", () => {
  it("muestra un estado de carga mientras llega la respuesta", () => {
    server.use(http.get("/games", () => new Promise(() => {})));

    renderWithClient(<GamesList />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando juegos…");
  });

  it("renderiza cada juego y lo linkea a su página", async () => {
    server.use(http.get("/games", () => HttpResponse.json(GAMES)));

    renderWithClient(<GamesList />);

    expect(await screen.findByText("D&D 5e")).toBeInTheDocument();
    expect(screen.getByText("Pathfinder")).toBeInTheDocument();
    const actions = screen.getAllByRole("button", { name: "Ver playbooks" });
    expect(actions[0]).toHaveAttribute("href", "/games/dnd5e");
    expect(actions[1]).toHaveAttribute("href", "/games/pathfinder");
  });

  it("muestra un estado vacío cuando no hay juegos", async () => {
    server.use(http.get("/games", () => HttpResponse.json([])));

    renderWithClient(<GamesList />);

    expect(
      await screen.findByText("No hay juegos disponibles todavía."),
    ).toBeInTheDocument();
  });

  it("muestra un error cuando la request falla (ej. endpoint aún no existe)", async () => {
    server.use(
      http.get("/games", () => HttpResponse.json({}, { status: 404 })),
    );

    renderWithClient(<GamesList />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los juegos",
    );
  });
});
