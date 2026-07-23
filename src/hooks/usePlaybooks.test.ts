import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { usePlaybooks } from "./usePlaybooks";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // Sin JSX: este archivo es `.test.ts` (el hook es TS puro, sin JSX propio),
  // así que el provider se arma con `createElement` en vez de `<Provider>`.
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

describe("usePlaybooks", () => {
  it("trae la lista completa de playbooks desde GET /playbooks", async () => {
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    server.use(
      http.get("/playbooks", ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        return HttpResponse.json([{ id: "guerrero", name: "Guerrero" }]);
      }),
    );

    const { result } = renderHook(() => usePlaybooks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ id: "guerrero", name: "Guerrero" }]);
    expect(receivedUrl).toBe("/playbooks");
    expect(receivedMethod).toBe("GET");
  });

  it("agrega ?gameId= a la URL cuando se pasa un gameId", async () => {
    let receivedSearch: string | undefined;
    server.use(
      http.get("/playbooks", ({ request }) => {
        receivedSearch = new URL(request.url).search;
        return HttpResponse.json([{ id: "guerrero" }]);
      }),
    );

    const { result } = renderHook(() => usePlaybooks("dnd5e"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(receivedSearch).toBe("?gameId=dnd5e");
  });

  it("expone el error cuando la request falla", async () => {
    server.use(
      http.get("/playbooks", () => HttpResponse.json({}, { status: 500 })),
    );

    const { result } = renderHook(() => usePlaybooks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 500 });
  });
});
