import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { usePlaybooks } from "./usePlaybooks";

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
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("trae la lista completa de playbooks desde GET /playbooks", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        mockResponse(200, [{ id: "guerrero", name: "Guerrero" }]),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePlaybooks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([{ id: "guerrero", name: "Guerrero" }]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/playbooks");
    expect(init.method).toBe("GET");
  });

  it("agrega ?gameId= a la URL cuando se pasa un gameId", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, [{ id: "guerrero" }]));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePlaybooks("dnd5e"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/playbooks?gameId=dnd5e");
  });

  it("expone el error cuando la request falla", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(500));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePlaybooks(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 500 });
  });
});
