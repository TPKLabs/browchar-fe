import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { http, HttpResponse } from "msw";
import type { CharacterListResponse } from "@tpklabs/browchar-contracts";

import { charactersQueryKey } from "@/hooks/useCharacters";
import { server } from "@/mocks/server";
import type { CharacterSummary } from "@/types";
import { CharacterCardContainer } from "./characterCardContainer";

const CHARACTER: CharacterSummary = {
  id: "char_1",
  name: "Mad Dog",
  playbookName: "Motorista",
  gameName: "Apocalypse World",
  createdAt: "2026-04-01T09:30:00.000Z",
  updatedAt: "2026-04-28T18:00:00.000Z",
};

function renderWithClient(ui: ReactNode, queryClient: QueryClient) {
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe("CharacterCardContainer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("elimina contra DELETE /characters/:id y saca al personaje de la cache del listado", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    server.use(
      http.delete("/characters/:id", ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        return new HttpResponse(null, { status: 204 });
      }),
      // El invalidate en segundo plano refetchea el listado; sin el personaje.
      http.get("/characters", () =>
        HttpResponse.json({
          data: [],
          meta: { page: 1, pageSize: 20, total: 0 },
        }),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const envelope: CharacterListResponse = {
      data: [
        {
          ...CHARACTER,
          ownerId: "usr_demo",
          values: {},
          deletedAt: null,
          playbookId: "pb_angel",
          playbookVersion: 1,
        },
      ],
      meta: { page: 1, pageSize: 20, total: 1 },
    };
    queryClient.setQueryData(
      charactersQueryKey({ page: 1, pageSize: 20 }),
      envelope,
    );

    renderWithClient(
      <CharacterCardContainer character={CHARACTER} />,
      queryClient,
    );

    fireEvent.click(screen.getByRole("button", { name: "Eliminar personaje" }));

    await waitFor(() => {
      const cached = queryClient.getQueryData<CharacterListResponse>(
        charactersQueryKey({ page: 1, pageSize: 20 }),
      );
      expect(cached?.data).toHaveLength(0);
    });
    expect(receivedUrl).toBe("/characters/char_1");
    expect(receivedMethod).toBe("DELETE");
  });
});
