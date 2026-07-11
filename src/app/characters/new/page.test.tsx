import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import NewCharacterPage from "./page";

describe("NewCharacterPage", () => {
  it("preselects the playbook from the query param", async () => {
    // Async Server Component sin hijos async: se invoca como función y se
    // renderiza el resultado (patrón soportado por Vitest + RTL).
    const ui = await NewCharacterPage({
      searchParams: Promise.resolve({ playbookId: "guerrero" }),
    });
    render(ui);

    expect(
      screen.getByRole("heading", { level: 1, name: "Crear personaje" }),
    ).toBeInTheDocument();
    // Con un playbook preseleccionado se muestra el campo name del form.
    expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument();
    // Y un campo propio del template del Guerrero.
    expect(screen.getByLabelText(/Concepto/)).toBeInTheDocument();
  });

  it("prompts for a game and playbook when the query param is missing or unknown", async () => {
    const ui = await NewCharacterPage({
      searchParams: Promise.resolve({ playbookId: "nope" }),
    });
    render(ui);

    expect(
      screen.getByText("Elegí un juego y un playbook para empezar."),
    ).toBeInTheDocument();
  });
});
