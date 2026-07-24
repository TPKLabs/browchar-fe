import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
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

function mockCharacterAndPlaybook() {
  server.use(
    http.get("/characters/:id", () => HttpResponse.json(character)),
    http.get("/playbooks/:id", () => HttpResponse.json(playbook)),
  );
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
    server.use(http.get("/characters/:id", () => new Promise(() => {})));

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando personaje…");
  });

  it("trae el personaje y su playbook, y renderiza el detalle", async () => {
    useRouter.mockReturnValue({ push });
    let receivedCharacterUrl: string | undefined;
    let receivedPlaybookUrl: string | undefined;
    server.use(
      http.get("/characters/:id", ({ request }) => {
        receivedCharacterUrl = new URL(request.url).pathname;
        return HttpResponse.json(character);
      }),
      http.get("/playbooks/:id", ({ request }) => {
        receivedPlaybookUrl = new URL(request.url).pathname;
        return HttpResponse.json(playbook);
      }),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(await screen.findByLabelText(/Nombre/)).toHaveValue("Doc");
    expect(receivedCharacterUrl).toBe("/characters/char_1");
    expect(receivedPlaybookUrl).toBe("/playbooks/angel");
  });

  it("guarda cambios contra PATCH /characters/:id", async () => {
    useRouter.mockReturnValue({ push });
    mockCharacterAndPlaybook();
    let receivedBody: unknown;
    server.use(
      http.patch("/characters/:id", async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ ...character, name: "Nuevo nombre" });
      }),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    const nameInput = await screen.findByLabelText(/Nombre/);
    fireEvent.change(nameInput, { target: { value: "Nuevo nombre" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(receivedBody).toEqual({ name: "Nuevo nombre", values: {} }),
    );
  });

  it("elimina el personaje contra DELETE /characters/:id y vuelve al listado", async () => {
    useRouter.mockReturnValue({ push });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockCharacterAndPlaybook();
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    server.use(
      http.delete("/characters/:id", ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    await screen.findByLabelText(/Nombre/);
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/characters"));
    expect(receivedUrl).toBe("/characters/char_1");
    expect(receivedMethod).toBe("DELETE");
  });

  it("muestra un error si la eliminación falla", async () => {
    useRouter.mockReturnValue({ push });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockCharacterAndPlaybook();
    server.use(
      http.delete("/characters/:id", () =>
        HttpResponse.json(
          { message: "Character char_1 no encontrado" },
          { status: 404 },
        ),
      ),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    await screen.findByLabelText(/Nombre/);
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(
      await screen.findByText("Este personaje ya no existe o fue eliminado."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("muestra un error si el guardado falla", async () => {
    useRouter.mockReturnValue({ push });
    mockCharacterAndPlaybook();
    server.use(
      http.patch("/characters/:id", () =>
        HttpResponse.json(
          { message: "Character char_1 no encontrado" },
          { status: 404 },
        ),
      ),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    const nameInput = await screen.findByLabelText(/Nombre/);
    fireEvent.change(nameInput, { target: { value: "Nuevo nombre" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(
      await screen.findByText("Este personaje no existe o fue eliminado."),
    ).toBeInTheDocument();
  });

  it("muestra un mensaje específico cuando el personaje no existe (404)", async () => {
    useRouter.mockReturnValue({ push });
    server.use(
      http.get("/characters/:id", () =>
        HttpResponse.json(
          { message: "Character char_1 no encontrado" },
          { status: 404 },
        ),
      ),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(
      await screen.findByText("Este personaje no existe o fue eliminado."),
    ).toBeInTheDocument();
  });

  it("muestra un error genérico ante una falla no-404", async () => {
    useRouter.mockReturnValue({ push });
    server.use(
      http.get("/characters/:id", () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(
      await screen.findByText(
        "No se pudo cargar el personaje. Intentá de nuevo más tarde.",
      ),
    ).toBeInTheDocument();
  });

  it("siempre muestra un link para volver al listado, incluso en error", async () => {
    useRouter.mockReturnValue({ push });
    server.use(
      http.get("/characters/:id", () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithClient(<CharacterDetailContainer characterId="char_1" />);

    expect(
      await screen.findByRole("button", { name: /Personajes/ }),
    ).toHaveAttribute("href", "/characters");
  });
});
