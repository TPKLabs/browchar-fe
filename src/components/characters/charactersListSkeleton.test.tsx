import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CharactersListSkeleton } from "./charactersListSkeleton";

describe("CharactersListSkeleton", () => {
  it("expone un status accesible de carga", () => {
    render(<CharactersListSkeleton />);
    const status = screen.getByRole("status", { name: "Cargando personajes" });
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent("Cargando personajes…");
  });

  it("renderiza la cantidad de placeholders pedida", () => {
    const { container } = render(<CharactersListSkeleton count={3} />);
    // Una card por placeholder (data-slot=card lo pone el primitivo).
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(3);
  });

  it("por defecto muestra 6 placeholders", () => {
    const { container } = render(<CharactersListSkeleton />);
    expect(container.querySelectorAll('[data-slot="card"]')).toHaveLength(6);
  });
});
