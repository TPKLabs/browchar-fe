import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import { FieldType, type PlaybookView } from "@/types";
import { CharacterCreateFormContainer } from "./characterCreateFormContainer";

const PLAYBOOKS: PlaybookView[] = [
  {
    id: "guerrero",
    name: "Guerrero",
    version: 3,
    createdAt: "2026-01-15T12:00:00.000Z",
    game: { gameId: "dnd5e", gameName: "D&D 5e" },
    template: [
      {
        id: "sec",
        title: "Sección",
        fields: [{ id: "concepto", label: "Concepto", type: FieldType.TEXT }],
      },
    ],
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
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("CharacterCreateFormContainer", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("muestra un estado de carga mientras llegan los playbooks", () => {
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(new Promise(() => {})));

    renderWithClient(<CharacterCreateFormContainer />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando playbooks…");
  });

  it("preselecciona el playbook a partir del query param una vez cargados", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse(200, PLAYBOOKS)),
    );

    renderWithClient(
      <CharacterCreateFormContainer initialPlaybookId="guerrero" />,
    );

    expect(await screen.findByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Concepto/)).toBeInTheDocument();
  });

  it("pide elegir juego y playbook cuando no hay id preseleccionado", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockResponse(200, PLAYBOOKS)),
    );

    renderWithClient(<CharacterCreateFormContainer />);

    expect(
      await screen.findByText("Elegí un juego y un playbook para empezar."),
    ).toBeInTheDocument();
  });

  it("muestra un error cuando la request de playbooks falla", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse(500)));

    renderWithClient(<CharacterCreateFormContainer />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los playbooks",
    );
  });

  it("al enviar, postea el personaje a POST /characters y muestra éxito", async () => {
    // Router por URL: GET /playbooks -> lista; POST /characters -> creado.
    const fetchMock = vi.fn((url: string, _init?: RequestInit) =>
      Promise.resolve(
        String(url).startsWith("/characters")
          ? mockResponse(201, { id: "char-1", name: "Aria" })
          : mockResponse(200, PLAYBOOKS),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    renderWithClient(
      <CharacterCreateFormContainer initialPlaybookId="guerrero" />,
    );

    fireEvent.change(await screen.findByLabelText(/Nombre/), {
      target: { value: "Aria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear personaje" }));

    expect(
      await screen.findByText(/Personaje «Aria» creado\./),
    ).toBeInTheDocument();
    // DEV-55: el `id` que devuelve POST /characters llega hasta el link "Ver
    // personaje" del detalle (DEV-51) — no se descarta en el container.
    expect(
      screen.getByRole("button", { name: "Ver personaje" }),
    ).toHaveAttribute("href", "/characters/char-1");

    const postCall = fetchMock.mock.calls.find((c) =>
      String(c[0]).startsWith("/characters"),
    );
    expect(postCall).toBeTruthy();
    const init = postCall![1]!;
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      name: "Aria",
      playbookId: "guerrero",
      ownerId: "usr_demo",
      values: { concepto: "" },
    });
  });
});
