import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
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

function mockPlaybooksSuccess() {
  server.use(http.get("/playbooks", () => HttpResponse.json(PLAYBOOKS)));
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
  it("muestra un estado de carga mientras llegan los playbooks", () => {
    server.use(http.get("/playbooks", () => new Promise(() => {})));

    renderWithClient(<CharacterCreateFormContainer />);

    expect(screen.getByRole("status")).toHaveTextContent("Cargando playbooks…");
  });

  it("preselecciona el playbook a partir del query param una vez cargados", async () => {
    mockPlaybooksSuccess();

    renderWithClient(
      <CharacterCreateFormContainer initialPlaybookId="guerrero" />,
    );

    expect(await screen.findByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Concepto/)).toBeInTheDocument();
  });

  it("pide elegir juego y playbook cuando no hay id preseleccionado", async () => {
    mockPlaybooksSuccess();

    renderWithClient(<CharacterCreateFormContainer />);

    expect(
      await screen.findByText("Elegí un juego y un playbook para empezar."),
    ).toBeInTheDocument();
  });

  it("muestra un error cuando la request de playbooks falla", async () => {
    server.use(
      http.get("/playbooks", () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithClient(<CharacterCreateFormContainer />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los playbooks",
    );
  });

  it("al enviar, postea el personaje a POST /characters y muestra éxito", async () => {
    mockPlaybooksSuccess();
    let receivedMethod: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post("/characters", async ({ request }) => {
        receivedMethod = request.method;
        receivedBody = await request.json();
        return HttpResponse.json(
          { id: "char-1", name: "Aria" },
          { status: 201 },
        );
      }),
    );

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

    expect(receivedMethod).toBe("POST");
    expect(receivedBody).toEqual({
      name: "Aria",
      playbookId: "guerrero",
      ownerId: "usr_demo",
      values: { concepto: "" },
    });
  });
});
