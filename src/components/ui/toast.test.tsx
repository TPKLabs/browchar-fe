import { afterEach, describe, expect, it } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";

import { Toaster } from "./toast";
import { toast } from "@/utils/toast";

// El manager es un singleton a nivel de módulo: vaciarlo entre tests evita que
// un toast quede colgado y se cuele en el siguiente render de `Toaster`.
afterEach(() => {
  act(() => {
    toast.dismiss();
  });
});

describe("Toaster", () => {
  it("muestra un toast de éxito con título y descripción", async () => {
    render(<Toaster />);

    act(() => {
      toast.success("Personaje creado", {
        description: "El personaje fue guardado correctamente.",
      });
    });

    expect(await screen.findByText("Personaje creado")).toBeInTheDocument();
    expect(
      screen.getByText("El personaje fue guardado correctamente."),
    ).toBeInTheDocument();
  });

  it("muestra un toast de error", async () => {
    render(<Toaster />);

    act(() => {
      toast.error("No se pudo eliminar el personaje");
    });

    // Los toasts high-priority (error) se anuncian en una live-region aparte
    // además del toast visible, así que el texto aparece más de una vez.
    const matches = await screen.findAllByText(
      "No se pudo eliminar el personaje",
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it("se cierra manualmente con el botón de cerrar", async () => {
    render(<Toaster />);

    act(() => {
      toast.info("Aviso temporal");
    });

    expect(await screen.findByText("Aviso temporal")).toBeInTheDocument();

    // En el stack colapsado los controles quedan `aria-hidden` hasta que el
    // viewport se expande (se navegan con F6): quedan fuera del árbol de
    // accesibilidad, así que los ubicamos por su `aria-label` en vez de por rol.
    act(() => {
      fireEvent.click(screen.getByLabelText("Cerrar"));
    });

    await waitFor(() =>
      expect(screen.queryByText("Aviso temporal")).not.toBeInTheDocument(),
    );
  });
});
