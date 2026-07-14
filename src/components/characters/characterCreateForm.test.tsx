import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FieldType, type PlaybookView } from "@/types";
import { ApiError } from "@/api/client";
import { CharacterCreateForm } from "./characterCreateForm";

const SIMPLE: PlaybookView = {
  id: "simple",
  name: "Simple",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  game: { gameId: "g", gameName: "Game" },
  template: [
    {
      id: "sec",
      title: "Sección",
      fields: [{ id: "nota", label: "Nota", type: FieldType.TEXT }],
    },
  ],
};

const REQUIRED: PlaybookView = {
  id: "required",
  name: "Con requerido",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  game: { gameId: "g", gameName: "Game" },
  template: [
    {
      id: "sec",
      fields: [
        {
          id: "clase",
          label: "Clase",
          type: FieldType.SELECT,
          required: true,
          options: [{ label: "A", value: "a" }],
        },
      ],
    },
  ],
};

const PLAYBOOKS = [SIMPLE, REQUIRED];

describe("CharacterCreateForm", () => {
  it("prompts for a game and playbook when nothing is selected", () => {
    render(<CharacterCreateForm playbooks={PLAYBOOKS} />);
    expect(
      screen.getByText("Elegí un juego y un playbook para empezar."),
    ).toBeInTheDocument();
  });

  it("disables the playbook select until a game is chosen", () => {
    render(<CharacterCreateForm playbooks={PLAYBOOKS} />);
    expect(screen.getByLabelText("Juego")).not.toBeDisabled();
    expect(screen.getByLabelText("Playbook")).toBeDisabled();
  });

  it("preselects the game and playbook from a deep-linked playbook id", () => {
    render(
      <CharacterCreateForm playbooks={PLAYBOOKS} initialPlaybookId="simple" />,
    );
    // El playbook queda elegido (el form ya se muestra) y su juego también.
    expect(screen.getByLabelText("Playbook")).not.toBeDisabled();
    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nota/)).toBeInTheDocument();
    expect(screen.getByText("Sección")).toBeInTheDocument();
  });

  it("blocks submit and shows an error when name is empty", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CharacterCreateForm
        playbooks={PLAYBOOKS}
        initialPlaybookId="simple"
        onSubmit={onSubmit}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Crear personaje" }));
    expect(
      await screen.findByText("El nombre es obligatorio"),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("blocks submit when a required template field is missing", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CharacterCreateForm
        playbooks={PLAYBOOKS}
        initialPlaybookId="required"
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Aria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear personaje" }));
    // DEV-153: el wording ahora viene del paquete compartido (back = fuente de
    // verdad), que rodea el label con comillas.
    expect(
      await screen.findByText('"Clase" es obligatorio'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a general error and re-enables submit when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("La API no responde"));
    render(
      <CharacterCreateForm
        playbooks={PLAYBOOKS}
        initialPlaybookId="simple"
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Aria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear personaje" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "La API no responde",
    );
    expect(
      screen.getByRole("button", { name: "Crear personaje" }),
    ).not.toBeDisabled();
  });

  it("mapea los errores de validación del back (400) al campo del template", async () => {
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiError(
          400,
          "Los datos del personaje no son válidos para el Playbook",
          [{ field: "nota", message: "La nota no es válida" }],
        ),
      );
    render(
      <CharacterCreateForm
        playbooks={PLAYBOOKS}
        initialPlaybookId="simple"
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Aria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear personaje" }));

    // El mensaje aparece al lado del campo `nota`, no solo como error general.
    expect(await screen.findByText("La nota no es válida")).toBeInTheDocument();
  });

  it("disables submit and shows a loading label while onSubmit is pending", async () => {
    let resolveSubmit: () => void = () => {};
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        }),
    );
    render(
      <CharacterCreateForm
        playbooks={PLAYBOOKS}
        initialPlaybookId="simple"
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Aria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear personaje" }));

    expect(await screen.findByText("Creando…")).toBeInTheDocument();
    expect(screen.getByText("Creando…").closest("button")).toBeDisabled();

    resolveSubmit();
    expect(
      await screen.findByText(/Personaje «Aria» creado\./),
    ).toBeInTheDocument();
  });

  it("submits a valid payload through the onSubmit seam", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <CharacterCreateForm
        playbooks={PLAYBOOKS}
        initialPlaybookId="simple"
        onSubmit={onSubmit}
      />,
    );
    fireEvent.change(screen.getByLabelText(/Nombre/), {
      target: { value: "Aria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear personaje" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      name: "Aria",
      playbookId: "simple",
      ownerId: "usr_demo",
      values: { nota: "" },
    });
    expect(
      await screen.findByText(/Personaje «Aria» creado\./),
    ).toBeInTheDocument();
  });
});
