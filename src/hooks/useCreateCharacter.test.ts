import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import type { CharacterCreateRequestBody } from "@/types";
import { useCreateCharacter } from "./useCreateCharacter";

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
  it("hace POST /characters con el input y devuelve el personaje creado", async () => {
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.post("/characters", async ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        receivedBody = await request.json();
        return HttpResponse.json(
          { id: "char-1", name: "Aria" },
          { status: 201 },
        );
      }),
    );

    const { result } = renderHook(() => useCreateCharacter(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({ id: "char-1", name: "Aria" });
    expect(receivedUrl).toBe("/characters");
    expect(receivedMethod).toBe("POST");
    expect(receivedBody).toEqual(INPUT);
  });

  it("expone el ApiError cuando el back rechaza (ej. 400 de validación)", async () => {
    server.use(
      http.post("/characters", () =>
        HttpResponse.json(
          {
            message: "Los datos del personaje no son válidos para el Playbook",
            errors: [{ field: "concepto", message: "concepto es requerido" }],
          },
          { status: 400 },
        ),
      ),
    );

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
