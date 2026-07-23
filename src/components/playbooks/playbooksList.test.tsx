import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { FieldType, type PlaybookView } from "@/types";
import { PlaybooksList } from "./playbooksList";

const PLAYBOOKS: PlaybookView[] = [
  {
    id: "guerrero",
    name: "Guerrero",
    version: 3,
    createdAt: "2026-01-15T12:00:00.000Z",
    description: "Combatiente cuerpo a cuerpo.",
    game: { gameId: "dnd5e", gameName: "D&D 5e" },
    template: [
      {
        id: "sec",
        fields: [{ id: "f", label: "F", type: FieldType.TEXT }],
      },
    ],
  },
  {
    id: "clerigo",
    name: "Clérigo",
    version: 2,
    createdAt: "2026-02-02T12:00:00.000Z",
    description: "Sanador con magia divina.",
    game: { gameId: "dnd5e", gameName: "D&D 5e" },
    template: [],
  },
  {
    id: "piromante",
    name: "Piromante",
    version: 1,
    createdAt: "2026-03-10T12:00:00.000Z",
    description: "Especialista en fuego.",
    game: { gameId: "pathfinder", gameName: "Pathfinder" },
    template: [],
  },
];

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("PlaybooksList", () => {
  it("muestra un estado de carga mientras llega la respuesta", () => {
    server.use(http.get("/playbooks", () => new Promise(() => {})));

    renderWithClient(<PlaybooksList />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando playbooks…");
  });

  it("renderiza cada playbook con su juego y versión", async () => {
    server.use(http.get("/playbooks", () => HttpResponse.json(PLAYBOOKS)));

    renderWithClient(<PlaybooksList />);

    expect(await screen.findByText("Guerrero")).toBeInTheDocument();
    expect(screen.getByText("Clérigo")).toBeInTheDocument();
    expect(screen.getByText("Piromante")).toBeInTheDocument();
    expect(screen.getAllByText("D&D 5e")).toHaveLength(2);
    expect(screen.getByText("Pathfinder")).toBeInTheDocument();
    expect(screen.getByText("v3")).toBeInTheDocument();
  });

  it("linkea cada playbook al form de creación con su id", async () => {
    server.use(http.get("/playbooks", () => HttpResponse.json(PLAYBOOKS)));

    renderWithClient(<PlaybooksList />);

    const actions = await screen.findAllByRole("button", {
      name: "Crear personaje",
    });
    expect(actions).toHaveLength(3);
    expect(actions[0]).toHaveAttribute(
      "href",
      "/characters/new?playbookId=guerrero",
    );
  });

  it("muestra un error cuando la request falla", async () => {
    server.use(
      http.get("/playbooks", () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithClient(<PlaybooksList />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los playbooks",
    );
  });

  it("muestra un estado vacío cuando no hay playbooks", async () => {
    server.use(http.get("/playbooks", () => HttpResponse.json([])));

    renderWithClient(<PlaybooksList />);

    expect(
      await screen.findByText("No hay playbooks disponibles todavía."),
    ).toBeInTheDocument();
  });

  it("pide los playbooks filtrados por gameId cuando se pasa uno", async () => {
    let receivedSearch: string | undefined;
    server.use(
      http.get("/playbooks", ({ request }) => {
        receivedSearch = new URL(request.url).search;
        return HttpResponse.json([PLAYBOOKS[0]]);
      }),
    );

    renderWithClient(<PlaybooksList gameId="dnd5e" />);

    await screen.findByText("Guerrero");
    expect(receivedSearch).toBe("?gameId=dnd5e");
  });
});
