import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

import { CharactersListContainer } from "./charactersListContainer";

function item(id: string, name: string) {
  return {
    id,
    name,
    ownerId: "usr_demo",
    values: {},
    createdAt: "2026-04-01T09:30:00.000Z",
    updatedAt: "2026-04-28T18:00:00.000Z",
    deletedAt: null,
    playbookId: "pb_angel",
    playbookVersion: 1,
    playbookName: "Angel",
    gameName: "Apocalypse World",
  };
}

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

const envelope = {
  data: [
    {
      id: "char_1",
      name: "Doc",
      ownerId: "usr_demo",
      values: {},
      createdAt: "2026-04-01T09:30:00.000Z",
      updatedAt: "2026-04-28T18:00:00.000Z",
      deletedAt: null,
      playbookId: "pb_angel",
      playbookVersion: 1,
      playbookName: "Angel",
      gameName: "Apocalypse World",
    },
  ],
  meta: { page: 1, pageSize: 20, total: 1 },
};

describe("CharactersListContainer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra un estado de carga mientras llegan los personajes", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderWithClient(<CharactersListContainer />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando personajes…",
    );
  });

  it("renderiza los personajes reales de GET /characters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, envelope));
    vi.stubGlobal("fetch", fetchMock);

    renderWithClient(<CharactersListContainer />);

    expect(await screen.findByText("Doc")).toBeInTheDocument();
    expect(screen.getByText("Angel")).toBeInTheDocument();
    expect(screen.getByText("Apocalypse World")).toBeInTheDocument();
    expect(String(fetchMock.mock.calls[0][0])).toContain("/characters");
  });

  it("muestra el estado vacío cuando la API no devuelve personajes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockResponse(200, {
          data: [],
          meta: { page: 1, pageSize: 20, total: 0 },
        }),
      ),
    );

    renderWithClient(<CharactersListContainer />);

    expect(
      await screen.findByText("Todavía no creaste ningún personaje."),
    ).toBeInTheDocument();
  });

  it("muestra un error cuando la request falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(500)));

    renderWithClient(<CharactersListContainer />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los personajes",
    );
  });

  it("no muestra controles de paginación cuando entra todo en una página", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse(200, envelope)),
    );

    renderWithClient(<CharactersListContainer />);

    await screen.findByText("Doc");
    expect(
      screen.queryByRole("navigation", { name: /paginación/i }),
    ).not.toBeInTheDocument();
  });

  it("muestra los controles y navega a la página siguiente usando meta", async () => {
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        mockResponse(
          200,
          String(url).includes("page=2")
            ? {
                data: [item("c2", "Vale")],
                meta: { page: 2, pageSize: 20, total: 45 },
              }
            : {
                data: [item("c1", "Doc")],
                meta: { page: 1, pageSize: 20, total: 45 },
              },
        ),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderWithClient(<CharactersListContainer />);

    // ceil(45 / 20) = 3 páginas.
    expect(await screen.findByText("Página 1 de 3")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /paginación/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(await screen.findByText("Página 2 de 3")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some((c) => String(c[0]).includes("page=2")),
      ).toBe(true),
    );
    expect(await screen.findByText("Vale")).toBeInTheDocument();
  });
});
