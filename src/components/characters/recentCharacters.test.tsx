import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { RecentCharacters } from "./recentCharacters";

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

describe("RecentCharacters", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("pide sólo la primera página con pageSize 3", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(200, {
        data: [item("c1", "Doc")],
        meta: { page: 1, pageSize: 3, total: 1 },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderWithClient(<RecentCharacters />);

    expect(await screen.findByText("Doc")).toBeInTheDocument();
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "/characters?page=1&pageSize=3",
    );
  });

  it("renderiza los personajes que devuelve la API (ya vienen capados a pageSize)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockResponse(200, {
          data: [item("c1", "Doc"), item("c2", "Rust"), item("c3", "Vale")],
          meta: { page: 1, pageSize: 3, total: 9 },
        }),
      ),
    );

    renderWithClient(<RecentCharacters />);

    expect(await screen.findByText("Doc")).toBeInTheDocument();
    expect(screen.getByText("Rust")).toBeInTheDocument();
    expect(screen.getByText("Vale")).toBeInTheDocument();
  });

  it("muestra el estado vacío propio de la home", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockResponse(200, {
          data: [],
          meta: { page: 1, pageSize: 3, total: 0 },
        }),
      ),
    );

    renderWithClient(<RecentCharacters />);

    expect(
      await screen.findByText(
        "Todavía no creaste ningún personaje. Elegí un playbook para empezar.",
      ),
    ).toBeInTheDocument();
  });

  it("muestra un error cuando la request falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(500)));

    renderWithClient(<RecentCharacters />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los personajes",
    );
  });
});
