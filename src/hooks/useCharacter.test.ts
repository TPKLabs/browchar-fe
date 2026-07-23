import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { characterQueryKey, useCharacter } from "./useCharacter";

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
  it("trae el personaje desde GET /characters/:id", async () => {
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    server.use(
      http.get("/characters/:id", ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        return HttpResponse.json(character);
      }),
    );

    const { result } = renderHook(() => useCharacter("char_1"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(character);
    expect(receivedUrl).toBe("/characters/char_1");
    expect(receivedMethod).toBe("GET");
  });

  it("expone un 404 cuando el personaje no existe (o fue soft-deleted)", async () => {
    server.use(
      http.get("/characters/:id", () =>
        HttpResponse.json(
          { message: "Character char_1 no encontrado" },
          { status: 404 },
        ),
      ),
    );

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

    let callCount = 0;
    server.use(
      http.get("/characters/:id", () => {
        callCount++;
        return HttpResponse.json({}, { status: 404 });
      }),
    );

    const { result } = renderHook(() => useCharacter("char_1"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(callCount).toBe(1);
  });

  it("keyea la query por id", () => {
    expect(characterQueryKey("char_1")).toEqual(["characters", "char_1"]);
  });
});
