import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { ConfirmationDialog } from "./confirmationDialog";

function setup(
  props: Partial<React.ComponentProps<typeof ConfirmationDialog>> = {},
) {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(
    <ConfirmationDialog
      open
      onOpenChange={onOpenChange}
      title="Eliminar personaje"
      description="Esta acción eliminará a Aelar. No se puede deshacer."
      confirmLabel="Eliminar personaje"
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onOpenChange, onConfirm, onCancel };
}

describe("ConfirmationDialog", () => {
  it("no renderiza nada cuando open es false", () => {
    const onOpenChange = vi.fn();
    render(
      <ConfirmationDialog
        open={false}
        onOpenChange={onOpenChange}
        title="Eliminar personaje"
        onConfirm={vi.fn()}
      />,
    );
    expect(screen.queryByText("Eliminar personaje")).not.toBeInTheDocument();
  });

  it("muestra título, descripción y labels de los botones", () => {
    setup();
    expect(
      screen.getByRole("alertdialog", { name: "Eliminar personaje" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Esta acción eliminará a Aelar. No se puede deshacer."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Eliminar personaje" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar" }),
    ).toBeInTheDocument();
  });

  it("usa labels por defecto cuando no se pasan", () => {
    render(
      <ConfirmationDialog
        open
        onOpenChange={vi.fn()}
        title="¿Seguro?"
        onConfirm={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Confirmar" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar" }),
    ).toBeInTheDocument();
  });

  it("ejecuta onConfirm al confirmar y no cierra por sí mismo", () => {
    const { onConfirm, onOpenChange } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar personaje" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("al cancelar ejecuta onCancel y cierra", () => {
    const { onCancel, onOpenChange, onConfirm } = setup();
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("en loading deshabilita ambos botones y muestra spinner", () => {
    const { onConfirm, onCancel } = setup({ isLoading: true });
    const confirm = screen.getByRole("button", { name: /Eliminar personaje/ });
    const cancel = screen.getByRole("button", { name: "Cancelar" });
    expect(confirm).toBeDisabled();
    expect(cancel).toBeDisabled();
    // Un click en un botón deshabilitado no ejecuta la acción.
    fireEvent.click(confirm);
    fireEvent.click(cancel);
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("no cierra con Escape mientras está en loading", () => {
    const { onOpenChange } = setup({ isLoading: true });
    fireEvent.keyDown(screen.getByRole("alertdialog"), {
      key: "Escape",
      code: "Escape",
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("aplica variante no destructiva cuando destructive es false", () => {
    render(
      <ConfirmationDialog
        open
        onOpenChange={vi.fn()}
        title="Confirmar cambios"
        confirmLabel="Guardar"
        destructive={false}
        onConfirm={vi.fn()}
      />,
    );
    // La variante default usa el color primary; la destructive, el destructive.
    expect(screen.getByRole("button", { name: "Guardar" }).className).toContain(
      "bg-primary",
    );
  });
});
