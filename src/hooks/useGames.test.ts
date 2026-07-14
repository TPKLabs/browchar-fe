import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { useGames } from "./useGames";

function mockResponse(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("trae los juegos desde GET /games", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, [{ id: "dnd5e", name: "D&D 5e" }]));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGames(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ id: "dnd5e", name: "D&D 5e" }]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/games");
    expect(init.method).toBe("GET");
  });

  it("expone el error cuando la request falla (ej. endpoint aún no existe)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(404));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useGames(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 404 });
  });
});
