import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/characters/characterCreateFormContainer", () => ({
  CharacterCreateFormContainer: ({
    initialPlaybookId,
  }: {
    initialPlaybookId?: string;
  }) => <div>container con playbookId={initialPlaybookId ?? "ninguno"}</div>,
}));

import NewCharacterPage from "./page";

describe("NewCharacterPage", () => {
  it("pasa el playbookId del query param al container", async () => {
    // Async Server Component sin hijos async: se invoca como función y se
    // renderiza el resultado (patrón soportado por Vitest + RTL).
    const ui = await NewCharacterPage({
      searchParams: Promise.resolve({ playbookId: "guerrero" }),
    });
    render(ui);

    expect(
      screen.getByText("container con playbookId=guerrero"),
    ).toBeInTheDocument();
  });

  it("pasa undefined cuando no hay query param", async () => {
    const ui = await NewCharacterPage({
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(
      screen.getByText("container con playbookId=ninguno"),
    ).toBeInTheDocument();
  });
});
