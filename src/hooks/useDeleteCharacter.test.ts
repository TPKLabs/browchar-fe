import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";
import type {
  CharacterListItem,
  CharacterListResponse,
} from "@tpklabs/browchar-contracts";

import { characterQueryKey } from "@/hooks/useCharacter";
import { charactersQueryKey } from "@/hooks/useCharacters";
import { useDeleteCharacter } from "@/hooks/useDeleteCharacter";
import { server } from "@/mocks/server";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

function makeClient() {
  return new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
}

function listItem(id: string, name: string): CharacterListItem {
  return {
    id,
    name,
    ownerId: "usr_demo",
    values: {},
    createdAt: "2026-04-01T09:30:00.000Z",
    updatedAt: "2026-04-28T18:00:00.000Z",
    deletedAt: null,
    playbookId: "pb_angel",
    playbookVersion: 1,
    playbookName: "Angel",
    gameName: "Apocalypse World",
  };
}

function seedList(queryClient: QueryClient) {
  const envelope: CharacterListResponse = {
    data: [listItem("char_1", "Aria"), listItem("char_2", "Rust")],
    meta: { page: 1, pageSize: 20, total: 2 },
  };
  queryClient.setQueryData(
    charactersQueryKey({ page: 1, pageSize: 20 }),
    envelope,
  );
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

    const queryClient = makeClient();
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(receivedUrl).toBe("/characters/char_1");
    expect(receivedMethod).toBe("DELETE");
  });

  it("saca al personaje de las páginas cacheadas del listado y decrementa el total", async () => {
    mockDeleteSuccess();

    const queryClient = makeClient();
    seedList(queryClient);
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<CharacterListResponse>(
      charactersQueryKey({ page: 1, pageSize: 20 }),
    );
    expect(cached?.data.map((c) => c.id)).toEqual(["char_2"]);
    expect(cached?.meta.total).toBe(1);
  });

  it("saca el detalle de la cache al eliminar", async () => {
    mockDeleteSuccess();

    const queryClient = makeClient();
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

    const queryClient = makeClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["characters"] });
  });

  it("trata un 404 como éxito terminal y reconcilia la cache igual", async () => {
    server.use(
      http.delete("/characters/:id", () =>
        HttpResponse.json(
          { message: "Character char_1 no encontrado" },
          { status: 404 },
        ),
      ),
    );

    const queryClient = makeClient();
    seedList(queryClient);
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.isError).toBe(false);

    const cached = queryClient.getQueryData<CharacterListResponse>(
      charactersQueryKey({ page: 1, pageSize: 20 }),
    );
    expect(cached?.data.map((c) => c.id)).toEqual(["char_2"]);
  });

  it("propaga un error genuino (500) sin tocar la cache", async () => {
    server.use(
      http.delete("/characters/:id", () =>
        HttpResponse.json({ message: "boom" }, { status: 500 }),
      ),
    );

    const queryClient = makeClient();
    seedList(queryClient);
    const { result } = renderHook(() => useDeleteCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate();

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 500 });

    const cached = queryClient.getQueryData<CharacterListResponse>(
      charactersQueryKey({ page: 1, pageSize: 20 }),
    );
    expect(cached?.data.map((c) => c.id)).toEqual(["char_1", "char_2"]);
  });
});
