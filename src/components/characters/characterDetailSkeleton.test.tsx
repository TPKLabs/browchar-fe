import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { CharacterDetailSkeleton } from "./characterDetailSkeleton";

describe("CharacterDetailSkeleton", () => {
  it("expone un status accesible de carga", () => {
    render(<CharacterDetailSkeleton />);
    const status = screen.getByRole("status", { name: "Cargando personaje" });
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent("Cargando personaje…");
  });

  it("renderiza una card de placeholder", () => {
    const { container } = render(<CharacterDetailSkeleton />);
    expect(container.querySelector('[data-slot="card"]')).toBeInTheDocument();
  });
});
