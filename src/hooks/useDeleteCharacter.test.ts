import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { characterQueryKey } from "./useCharacter";
import { useDeleteCharacter } from "./useDeleteCharacter";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

function mockDeleteSuccess() {
  server.use(
    http.delete(
      "/characters/:id",
      () => new HttpResponse(null, { status: 204 }),
    ),
  );
}

describe("useDeleteCharacter", () => {
  it("hace DELETE /characters/:id", async () => {
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    server.use(
      http.delete("/characters/:id", ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(receivedUrl).toBe("/characters/char_1");
    expect(receivedMethod).toBe("DELETE");
  });

  it("saca el detalle de la cache al eliminar", async () => {
    mockDeleteSuccess();

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(characterQueryKey("char_1"), {
      id: "char_1",
      name: "Aria",
    });
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(
      queryClient.getQueryData(characterQueryKey("char_1")),
    ).toBeUndefined();
  });

  it("invalida el listado de personajes al eliminar", async () => {
    mockDeleteSuccess();

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["characters"] });
  });

  it("expone el ApiError cuando el personaje no existe (404)", async () => {
    server.use(
      http.delete("/characters/:id", () =>
        HttpResponse.json(
          { message: "Character char_1 no encontrado" },
          { status: 404 },
        ),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 404 });
  });
});
