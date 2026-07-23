import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { charactersQueryKey, useCharacters } from "./useCharacters";

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
  it("trae el envelope paginado desde GET /characters con los defaults", async () => {
    let receivedMethod: string | undefined;
    server.use(
      http.get("/characters", ({ request }) => {
        receivedMethod = request.method;
        return HttpResponse.json(page);
      }),
    );

    const { result } = renderHook(() => useCharacters(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(page);
    expect(receivedMethod).toBe("GET");
  });

  it("pasa page y pageSize a la query string", async () => {
    let receivedSearch: string | undefined;
    server.use(
      http.get("/characters", ({ request }) => {
        receivedSearch = new URL(request.url).search;
        return HttpResponse.json(page);
      }),
    );

    const { result } = renderHook(
      () => useCharacters({ page: 3, pageSize: 5 }),
      {
        wrapper: createWrapper(),
      },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(receivedSearch).toBe("?page=3&pageSize=5");
  });

  it("expone el error cuando la request falla", async () => {
    server.use(
      http.get("/characters", () => HttpResponse.json({}, { status: 500 })),
    );

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
