import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { CharactersListContainer } from "./charactersListContainer";

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
      vi
        .fn()
        .mockResolvedValue(
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
});
