import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { RecentCharacters } from "./recentCharacters";

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
  it("pide sólo la primera página con pageSize 3", async () => {
    let receivedUrl: string | undefined;
    server.use(
      http.get("/characters", ({ request }) => {
        receivedUrl =
          new URL(request.url).pathname + new URL(request.url).search;
        return HttpResponse.json({
          data: [item("c1", "Doc")],
          meta: { page: 1, pageSize: 3, total: 1 },
        });
      }),
    );

    renderWithClient(<RecentCharacters />);

    expect(await screen.findByText("Doc")).toBeInTheDocument();
    expect(receivedUrl).toBe("/characters?page=1&pageSize=3");
  });

  it("renderiza los personajes que devuelve la API (ya vienen capados a pageSize)", async () => {
    server.use(
      http.get("/characters", () =>
        HttpResponse.json({
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
    server.use(
      http.get("/characters", () =>
        HttpResponse.json({
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
    server.use(
      http.get("/characters", () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithClient(<RecentCharacters />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los personajes",
    );
  });
});
