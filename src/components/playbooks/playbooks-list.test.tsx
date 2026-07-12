import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { FieldType, type PlaybookView } from "@/lib/types";
import { PlaybooksList } from "./playbooks-list";

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

describe("PlaybooksList", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra un estado de carga mientras llega la respuesta", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderWithClient(<PlaybooksList />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando playbooks…");
  });

  it("renderiza cada playbook con su juego y versión", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse(200, PLAYBOOKS)),
    );

    renderWithClient(<PlaybooksList />);

    expect(await screen.findByText("Guerrero")).toBeInTheDocument();
    expect(screen.getByText("Clérigo")).toBeInTheDocument();
    expect(screen.getByText("Piromante")).toBeInTheDocument();
    expect(screen.getAllByText("D&D 5e")).toHaveLength(2);
    expect(screen.getByText("Pathfinder")).toBeInTheDocument();
    expect(screen.getByText("v3")).toBeInTheDocument();
  });

  it("linkea cada playbook al form de creación con su id", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse(200, PLAYBOOKS)),
    );

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
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(500)));

    renderWithClient(<PlaybooksList />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los playbooks",
    );
  });

  it("muestra un estado vacío cuando no hay playbooks", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(200, [])));

    renderWithClient(<PlaybooksList />);

    expect(
      await screen.findByText("No hay playbooks disponibles todavía."),
    ).toBeInTheDocument();
  });

  it("pide los playbooks filtrados por gameId cuando se pasa uno", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, [PLAYBOOKS[0]]));
    vi.stubGlobal("fetch", fetchMock);

    renderWithClient(<PlaybooksList gameId="dnd5e" />);

    await screen.findByText("Guerrero");
    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/playbooks?gameId=dnd5e");
  });
});
