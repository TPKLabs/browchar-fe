import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { FieldType, type CharacterView, type PlaybookView } from "@/types";
import { CharacterDetail } from "./characterDetail";

const { push, useRouter } = vi.hoisted(() => ({
  push: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter }));

const character: CharacterView = {
  id: "char_1",
  name: "Doc",
  ownerId: "usr_demo",
  playbookId: "angel",
  playbookVersion: 1,
  values: { cool: 2, moniker: "Grim", hasRep: true, look: "grim" },
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-16T12:00:00.000Z",
  deletedAt: null,
};

const playbook: PlaybookView = {
  id: "angel",
  name: "Angel",
  version: 1,
  createdAt: "2026-01-01T00:00:00.000Z",
  game: { gameId: "aw", gameName: "Apocalypse World" },
  template: [
    {
      id: "stats",
      title: "Stats",
      fields: [
        {
          id: "cool",
          label: "Cool",
          type: FieldType.TEXTNUMBER,
          required: true,
        },
        { id: "moniker", label: "Apodo", type: FieldType.TEXT },
        { id: "hasRep", label: "Tiene reputación", type: FieldType.CHECKBOX },
        {
          id: "look",
          label: "Look",
          type: FieldType.SELECT,
          options: [
            { label: "Sombrío", value: "grim" },
            { label: "Alegre", value: "cheerful" },
          ],
        },
      ],
    },
  ],
};

describe("CharacterDetail", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("muestra los campos ya editables, precargados con los valores actuales", () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    expect(screen.getByLabelText(/Nombre/)).toHaveValue("Doc");
    expect(screen.getByLabelText(/Nombre/)).not.toBeDisabled();
    expect(screen.getByLabelText(/^Cool/)).toHaveValue(2);
    expect(screen.getByLabelText(/^Cool/)).not.toBeDisabled();
    expect(screen.getByLabelText("Apodo")).toHaveValue("Grim");
    expect(
      screen.getByRole("checkbox", { name: /Tiene reputación/ }),
    ).toBeChecked();
  });

  it("muestra el nombre del juego como chip", () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    expect(screen.getByText("Apocalypse World")).toBeInTheDocument();
  });

  it("muestra el playbook como dropdown, no como chip", () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    const playbookSelect = screen.getByRole("combobox", { name: "Playbook" });
    expect(playbookSelect).toHaveTextContent("Angel");
    // Reasignar playbook implica reconstruir template/values — todavía no
    // resuelto (ver PR #28), así que por ahora es solo de lectura.
    expect(playbookSelect).toBeDisabled();
  });

  it("tiene un link para volver al listado", () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    expect(screen.getByRole("button", { name: /Personajes/ })).toHaveAttribute(
      "href",
      "/characters",
    );
  });

  it('"Guardar cambios" arranca deshabilitado: nada que guardar todavía', () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    expect(
      screen.getByRole("button", { name: "Guardar cambios" }),
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it('al editar un campo se habilita "Guardar cambios" y "Cancelar"', () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Otro apodo" },
    });

    expect(
      screen.getByRole("button", { name: "Guardar cambios" }),
    ).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).not.toBeDisabled();
  });

  it('"Cancelar" descarta los cambios y vuelve a deshabilitarse', () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Otro apodo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByLabelText("Apodo")).toHaveValue("Grim");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Guardar cambios" }),
    ).toBeDisabled();
  });

  it('"Guardar cambios" llama a onSave y vuelve a deshabilitarse (nuevo baseline)', async () => {
    useRouter.mockReturnValue({ push });
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <CharacterDetail
        character={character}
        playbook={playbook}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Nuevo apodo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Guardar cambios" }),
      ).toBeDisabled(),
    );

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Doc",
        values: expect.objectContaining({ moniker: "Nuevo apodo" }),
      }),
    );
    expect(screen.getByLabelText("Apodo")).toHaveValue("Nuevo apodo");
  });

  it("no permite guardar si un campo requerido queda vacío", async () => {
    useRouter.mockReturnValue({ push });
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(
      <CharacterDetail
        character={character}
        playbook={playbook}
        onSave={onSave}
      />,
    );

    fireEvent.change(screen.getByLabelText(/^Cool/), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('"Eliminar" pide confirmación y, al aceptar, vuelve al listado', () => {
    useRouter.mockReturnValue({ push });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<CharacterDetail character={character} playbook={playbook} />);
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(confirmSpy).toHaveBeenCalledWith("¿Eliminar a Doc?");
    expect(push).toHaveBeenCalledWith("/characters");
  });

  it("Eliminar no navega si se cancela la confirmación", () => {
    useRouter.mockReturnValue({ push });
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<CharacterDetail character={character} playbook={playbook} />);
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(push).not.toHaveBeenCalled();
  });

  it("Eliminar siempre está habilitado, haya o no cambios sin guardar", () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    expect(screen.getByRole("button", { name: /Eliminar/ })).not.toBeDisabled();
  });
});
