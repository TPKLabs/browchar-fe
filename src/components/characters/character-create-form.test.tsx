import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FieldType, type PlaybookView } from "@/lib/types";
import { CharacterCreateForm } from "./character-create-form";

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
      ownerId: "dev-owner",
      values: { nota: "" },
    });
    expect(
      await screen.findByText(/Personaje «Aria» listo para crear\./),
    ).toBeInTheDocument();
  });
});
