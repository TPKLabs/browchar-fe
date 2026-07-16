import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { CharacterDetailContainer } from "./characterDetailContainer";

const { push, useRouter } = vi.hoisted(() => ({
  push: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter }));

const character = {
  id: "char_1",
  name: "Doc",
  ownerId: "usr_demo",
  playbookId: "angel",
  playbookVersion: 1,
  values: { cool: 2 },
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-15T12:00:00.000Z",
  deletedAt: null,
};

const playbook = {
  id: "angel",
  name: "Angel",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  game: { gameId: "aw", gameName: "Apocalypse World" },
  template: [],
};

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

describe("CharacterDetailContainer", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("muestra un estado de carga mientras llega el personaje", () => {
    useRouter.mockReturnValue({ push });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando personaje…");
  });

  it("trae el personaje y su playbook, y renderiza el detalle", async () => {
    useRouter.mockReturnValue({ push });
    const fetchMock = vi.fn((url: string) =>
      Promise.resolve(
        String(url).startsWith("/characters")
          ? mockResponse(200, character)
          : mockResponse(200, playbook),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(await screen.findByLabelText(/Nombre/)).toHaveValue("Doc");
    expect(fetchMock).toHaveBeenCalledWith(
      "/characters/char_1",
      expect.objectContaining({ method: "GET" }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/playbooks/angel",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("muestra un mensaje específico cuando el personaje no existe (404)", async () => {
    useRouter.mockReturnValue({ push });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          mockResponse(404, { message: "Character char_1 no encontrado" }),
        ),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(
      await screen.findByText("Este personaje no existe o fue eliminado."),
    ).toBeInTheDocument();
  });

  it("muestra un error genérico ante una falla no-404", async () => {
    useRouter.mockReturnValue({ push });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(500)));

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(
      await screen.findByText(
        "No se pudo cargar el personaje. Intentá de nuevo más tarde.",
      ),
    ).toBeInTheDocument();
  });

  it("siempre muestra un link para volver al listado, incluso en error", async () => {
    useRouter.mockReturnValue({ push });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(500)));

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(
      await screen.findByRole("button", { name: /Personajes/ }),
    ).toHaveAttribute("href", "/characters");
  });
});
