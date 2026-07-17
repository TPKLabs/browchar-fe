import { afterEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";

import type { CharacterCreateRequestBody } from "@/types";
import { useCreateCharacter } from "./useCreateCharacter";

function mockResponse(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const INPUT: CharacterCreateRequestBody = {
  name: "Aria",
  playbookId: "pb-1",
  ownerId: "dev-owner",
  values: { concepto: "una vagabunda" },
};

describe("useCreateCharacter", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hace POST /characters con el input y devuelve el personaje creado", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(201, { id: "char-1", name: "Aria" }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCreateCharacter(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({ id: "char-1", name: "Aria" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/characters");
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify(INPUT));
  });

  it("expone el ApiError cuando el back rechaza (ej. 400 de validación)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(400, {
        message: "Los datos del personaje no son válidos para el Playbook",
        errors: [{ field: "concepto", message: "concepto es requerido" }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useCreateCharacter(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      status: 400,
      message: "Los datos del personaje no son válidos para el Playbook",
    });
  });
});
