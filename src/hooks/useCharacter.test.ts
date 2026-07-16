import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import { characterQueryKey, useCharacter } from "./useCharacter";

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

const character = {
  id: "char_1",
  name: "Doc",
  ownerId: "usr_demo",
  playbookId: "angel",
  playbookVersion: 1,
  values: { cool: 2 },
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-15T12:00:00.000Z",
  deletedAt: null,
};

describe("useCharacter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("trae el personaje desde GET /characters/:id", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, character));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCharacter("char_1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(character);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/characters/char_1");
    expect(init.method).toBe("GET");
  });

  it("expone un 404 cuando el personaje no existe (o fue soft-deleted)", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        mockResponse(404, { message: "Character char_1 no encontrado" }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCharacter("char_1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 404 });
  });

  it("no reintenta ante un 404: no es un error transitorio", async () => {
    // Sin `retry: false` en el QueryClient (a diferencia de `createWrapper`):
    // así se ejercita el `retry` propio del hook, no el override del test.
    const queryClient = new QueryClient();
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);

    const fetchMock = vi.fn().mockResolvedValue(mockResponse(404));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCharacter("char_1"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keyea la query por id", () => {
    expect(characterQueryKey("char_1")).toEqual(["characters", "char_1"]);
  });
});
