import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { QueryEmpty, QueryError, QueryLoading } from "./query-state";

describe("QueryLoading", () => {
  it("expone role=status con el label recibido", () => {
    render(<QueryLoading label="Cargando…" />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando…");
  });
});

describe("QueryError", () => {
  it("expone role=alert con el label recibido", () => {
    render(<QueryError label="Falló." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Falló.");
  });
});

describe("QueryEmpty", () => {
  it("muestra el label recibido", () => {
    render(<QueryEmpty label="No hay nada." />);
    expect(screen.getByText("No hay nada.")).toBeInTheDocument();
  });
});
