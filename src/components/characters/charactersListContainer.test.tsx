import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
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
  it("muestra un estado de carga mientras llegan los personajes", () => {
    server.use(http.get("/characters", () => new Promise(() => {})));

    renderWithClient(<CharactersListContainer />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando personajes…",
    );
  });

  it("renderiza los personajes reales de GET /characters", async () => {
    let requested = false;
    server.use(
      http.get("/characters", () => {
        requested = true;
        return HttpResponse.json(envelope);
      }),
    );

    renderWithClient(<CharactersListContainer />);

    expect(await screen.findByText("Doc")).toBeInTheDocument();
    expect(screen.getByText("Angel")).toBeInTheDocument();
    expect(screen.getByText("Apocalypse World")).toBeInTheDocument();
    expect(requested).toBe(true);
  });

  it("muestra el estado vacío cuando la API no devuelve personajes", async () => {
    server.use(
      http.get("/characters", () =>
        HttpResponse.json({
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
    server.use(
      http.get("/characters", () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithClient(<CharactersListContainer />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los personajes",
    );
  });

  it("no muestra controles de paginación cuando entra todo en una página", async () => {
    server.use(http.get("/characters", () => HttpResponse.json(envelope)));

    renderWithClient(<CharactersListContainer />);

    await screen.findByText("Doc");
    expect(
      screen.queryByRole("navigation", { name: /paginación/i }),
    ).not.toBeInTheDocument();
  });

  it("muestra los controles y navega a la página siguiente usando meta", async () => {
    let requestedPage2 = false;
    server.use(
      http.get("/characters", ({ request }) => {
        const page = new URL(request.url).searchParams.get("page");
        if (page === "2") {
          requestedPage2 = true;
          return HttpResponse.json({
            data: [item("c2", "Vale")],
            meta: { page: 2, pageSize: 20, total: 45 },
          });
        }
        return HttpResponse.json({
          data: [item("c1", "Doc")],
          meta: { page: 1, pageSize: 20, total: 45 },
        });
      }),
    );

    renderWithClient(<CharactersListContainer />);

    // ceil(45 / 20) = 3 páginas.
    expect(await screen.findByText("Página 1 de 3")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /paginación/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    expect(await screen.findByText("Página 2 de 3")).toBeInTheDocument();
    await waitFor(() => expect(requestedPage2).toBe(true));
    expect(await screen.findByText("Vale")).toBeInTheDocument();
  });
});
