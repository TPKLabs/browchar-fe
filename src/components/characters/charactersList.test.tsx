import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

import type { CharacterSummary } from "@/types";
import { CharactersList } from "./charactersList";

const CHARACTERS: CharacterSummary[] = [
  {
    id: "char_1",
    name: "Mad Dog",
    playbookName: "Motorista",
    gameName: "Apocalypse World",
    campaignName: "Ruinas de Neo Tokio",
    createdAt: "2026-04-01T09:30:00.000Z",
    updatedAt: "2026-04-28T18:00:00.000Z",
  },
  {
    id: "char_2",
    name: "Silent Star",
    playbookName: "Ángel",
    gameName: "Apocalypse World",
    createdAt: "2026-04-15T10:00:00.000Z",
    updatedAt: "2026-04-15T10:00:00.000Z",
  },
];

function renderWithClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("CharactersList", () => {
  it("muestra un estado de carga", () => {
    renderWithClient(
      <CharactersList characters={[]} isPending isError={false} />,
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Cargando personajes…",
    );
  });

  it("muestra un error", () => {
    renderWithClient(
      <CharactersList characters={[]} isPending={false} isError />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudieron cargar los personajes",
    );
  });

  it("muestra un estado vacío cuando no hay personajes", () => {
    renderWithClient(
      <CharactersList characters={[]} isPending={false} isError={false} />,
    );
    expect(
      screen.getByText("Todavía no creaste ningún personaje."),
    ).toBeInTheDocument();
  });

  it("renderiza cada personaje", () => {
    renderWithClient(
      <CharactersList
        characters={CHARACTERS}
        isPending={false}
        isError={false}
      />,
    );
    expect(screen.getByText("Mad Dog")).toBeInTheDocument();
    expect(screen.getByText("Silent Star")).toBeInTheDocument();
  });
});
