import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { charactersQueryKey, useCharacters } from "./useCharacters";

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

const page = {
  data: [
    {
      id: "char_1",
      name: "Doc",
      playbookName: "Angel",
      gameName: "Apocalypse World",
    },
  ],
  meta: { page: 1, pageSize: 20, total: 1 },
};

describe("useCharacters", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("trae el envelope paginado desde GET /characters con los defaults", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, page));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCharacters(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(page);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/characters?page=1&pageSize=20");
    expect(init.method).toBe("GET");
  });

  it("pasa page y pageSize a la query string", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, page));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(
      () => useCharacters({ page: 3, pageSize: 5 }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe("/characters?page=3&pageSize=5");
  });

  it("expone el error cuando la request falla", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(500));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCharacters(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 500 });
  });

  it("keyea la query por page y pageSize", () => {
    expect(charactersQueryKey()).toEqual([
      "characters",
      { page: 1, pageSize: 20 },
    ]);
    expect(charactersQueryKey({ page: 2, pageSize: 5 })).toEqual([
      "characters",
      { page: 2, pageSize: 5 },
    ]);
  });
});
