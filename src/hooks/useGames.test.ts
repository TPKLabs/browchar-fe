import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { useGames } from "./useGames";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("useGames", () => {
  it("trae los juegos desde GET /games", async () => {
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    server.use(
      http.get("/games", ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        return HttpResponse.json([{ id: "dnd5e", name: "D&D 5e" }]);
      }),
    );

    const { result } = renderHook(() => useGames(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ id: "dnd5e", name: "D&D 5e" }]);
    expect(receivedUrl).toBe("/games");
    expect(receivedMethod).toBe("GET");
  });

  it("expone el error cuando la request falla (ej. endpoint aún no existe)", async () => {
    server.use(
      http.get("/games", () => HttpResponse.json({}, { status: 404 })),
    );

    const { result } = renderHook(() => useGames(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 404 });
  });
});
