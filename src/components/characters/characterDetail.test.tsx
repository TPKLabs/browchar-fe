import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { ApiError } from "@/api/client";
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

  it("deshabilita el formulario mientras el guardado estÃ¡ pendiente", async () => {
    useRouter.mockReturnValue({ push });
    let resolveSave!: () => void;
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSave = resolve;
        }),
    );

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

    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(screen.getByLabelText(/Nombre/)).toBeDisabled();
    expect(screen.getByLabelText("Apodo")).toBeDisabled();
    expect(
      screen.getByRole("checkbox", { name: /Tiene reputaci/ }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("combobox", { name: "Look" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Eliminar/ })).toBeDisabled();

    resolveSave();
    await waitFor(() => expect(screen.getByLabelText("Apodo")).toBeEnabled());
  });

  it('muestra un mensaje de "no existe" cuando onSave rechaza con un 404', async () => {
    useRouter.mockReturnValue({ push });
    const onSave = vi
      .fn()
      .mockRejectedValue(new ApiError(404, "Character char_1 no encontrado"));

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

    expect(
      await screen.findByText("Este personaje no existe o fue eliminado."),
    ).toBeInTheDocument();
    // El baseline no cambia: sigue dirty, con el valor sin guardar.
    expect(screen.getByLabelText("Apodo")).toHaveValue("Nuevo apodo");
    expect(
      screen.getByRole("button", { name: "Guardar cambios" }),
    ).not.toBeDisabled();
  });

  it("muestra el mensaje del back cuando onSave rechaza con un 400 de validación", async () => {
    useRouter.mockReturnValue({ push });
    const onSave = vi
      .fn()
      .mockRejectedValue(
        new ApiError(400, "Los datos del personaje no son válidos"),
      );

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

    expect(
      await screen.findByText("Los datos del personaje no son válidos"),
    ).toBeInTheDocument();
  });

  it("muestra un mensaje genérico ante un error inesperado de onSave", async () => {
    useRouter.mockReturnValue({ push });
    const onSave = vi.fn().mockRejectedValue(new Error("network down"));

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

    expect(
      await screen.findByText(
        "No se pudo guardar el personaje. Intentá de nuevo más tarde.",
      ),
    ).toBeInTheDocument();
  });

  it('"Cancelar" descarta un error de guardado previo', async () => {
    useRouter.mockReturnValue({ push });
    const onSave = vi
      .fn()
      .mockRejectedValue(new ApiError(404, "Character char_1 no encontrado"));

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
    await screen.findByText("Este personaje no existe o fue eliminado.");

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(
      screen.queryByText("Este personaje no existe o fue eliminado."),
    ).not.toBeInTheDocument();
  });

  it('"Cancelar" tras un guardado exitoso vuelve al último guardado, no al valor original', async () => {
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
      target: { value: "Primer guardado" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Guardar cambios" }),
      ).toBeDisabled(),
    );

    fireEvent.change(screen.getByLabelText("Apodo"), {
      target: { value: "Edición sin guardar" },
    });
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Cancelar" }),
      ).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(screen.getByLabelText("Apodo")).toHaveValue("Primer guardado");
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

  it('"Eliminar" pide confirmación y, al aceptar, llama a onDelete y vuelve al listado', async () => {
    useRouter.mockReturnValue({ push });
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <CharacterDetail
        character={character}
        playbook={playbook}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(confirmSpy).toHaveBeenCalledWith("¿Eliminar a Doc?");
    await waitFor(() => expect(push).toHaveBeenCalledWith("/characters"));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("Eliminar no llama a onDelete ni navega si se cancela la confirmación", () => {
    useRouter.mockReturnValue({ push });
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <CharacterDetail
        character={character}
        playbook={playbook}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("Eliminar siempre está habilitado, haya o no cambios sin guardar", () => {
    useRouter.mockReturnValue({ push });
    render(<CharacterDetail character={character} playbook={playbook} />);

    expect(screen.getByRole("button", { name: /Eliminar/ })).not.toBeDisabled();
  });

  it('muestra "Eliminando…" y deshabilita el botón mientras onDelete está pendiente', async () => {
    useRouter.mockReturnValue({ push });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let resolveDelete!: () => void;
    const onDelete = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        }),
    );

    render(
      <CharacterDetail
        character={character}
        playbook={playbook}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Eliminando/ })).toBeDisabled(),
    );
    expect(push).not.toHaveBeenCalled();

    resolveDelete();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/characters"));
  });

  it("muestra un mensaje cuando onDelete rechaza con un 404 y no navega", async () => {
    useRouter.mockReturnValue({ push });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi
      .fn()
      .mockRejectedValue(new ApiError(404, "Character char_1 no encontrado"));

    render(
      <CharacterDetail
        character={character}
        playbook={playbook}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(
      await screen.findByText("Este personaje ya no existe o fue eliminado."),
    ).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: /Eliminar/ })).not.toBeDisabled();
  });

  it("muestra un mensaje genérico cuando onDelete rechaza con un error inesperado", async () => {
    useRouter.mockReturnValue({ push });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    const onDelete = vi.fn().mockRejectedValue(new Error("network down"));

    render(
      <CharacterDetail
        character={character}
        playbook={playbook}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Eliminar/ }));

    expect(
      await screen.findByText(
        "No se pudo eliminar el personaje. Intentá de nuevo más tarde.",
      ),
    ).toBeInTheDocument();
  });

  describe("auto-save (DEV-65)", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("dispara un guardado automático a los 7s si hay cambios sin guardar", async () => {
      useRouter.mockReturnValue({ push });
      vi.useFakeTimers();
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
      await vi.advanceTimersByTimeAsync(7000);

      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          values: expect.objectContaining({ moniker: "Nuevo apodo" }),
        }),
      );
    });

    it("no dispara auto-save si no hay cambios sin guardar", async () => {
      useRouter.mockReturnValue({ push });
      vi.useFakeTimers();
      const onSave = vi.fn().mockResolvedValue(undefined);

      render(
        <CharacterDetail
          character={character}
          playbook={playbook}
          onSave={onSave}
        />,
      );

      await vi.advanceTimersByTimeAsync(10000);

      expect(onSave).not.toHaveBeenCalled();
    });

    it('muestra "Guardando…" y después "Guardado" junto al botón', async () => {
      useRouter.mockReturnValue({ push });
      vi.useFakeTimers();
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
      await vi.advanceTimersByTimeAsync(7000);

      expect(screen.getByRole("status")).toHaveTextContent("Guardado");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(10000);
      });

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    it("sigue guardando automáticamente tras cada intervalo mientras siga dirty", async () => {
      useRouter.mockReturnValue({ push });
      vi.useFakeTimers();
      const onSave = vi.fn().mockResolvedValue(undefined);

      render(
        <CharacterDetail
          character={character}
          playbook={playbook}
          onSave={onSave}
        />,
      );

      fireEvent.change(screen.getByLabelText("Apodo"), {
        target: { value: "Primero" },
      });
      await vi.advanceTimersByTimeAsync(7000);
      expect(onSave).toHaveBeenCalledTimes(1);

      fireEvent.change(screen.getByLabelText("Apodo"), {
        target: { value: "Segundo" },
      });
      await vi.advanceTimersByTimeAsync(7000);
      expect(onSave).toHaveBeenCalledTimes(2);
    });
  });
});
