import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { CharactersPagination } from "./charactersPagination";

describe("CharactersPagination", () => {
  it("muestra la página actual y el total de páginas (redondea hacia arriba)", () => {
    render(
      <CharactersPagination
        page={2}
        pageSize={20}
        total={45}
        onPageChange={() => {}}
      />,
    );
    // ceil(45 / 20) = 3
    expect(screen.getByText("Página 2 de 3")).toBeInTheDocument();
  });

  it("deshabilita Anterior en la primera página", () => {
    render(
      <CharactersPagination
        page={1}
        pageSize={20}
        total={45}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeEnabled();
  });

  it("deshabilita Siguiente en la última página", () => {
    render(
      <CharactersPagination
        page={3}
        pageSize={20}
        total={45}
        onPageChange={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /anterior/i })).toBeEnabled();
  });

  it("notifica el cambio de página al hacer click", () => {
    const onPageChange = vi.fn();
    render(
      <CharactersPagination
        page={2}
        pageSize={20}
        total={45}
        onPageChange={onPageChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    fireEvent.click(screen.getByRole("button", { name: /anterior/i }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
