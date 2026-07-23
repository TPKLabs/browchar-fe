import { describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { http, HttpResponse } from "msw";

import { server } from "@/mocks/server";
import { characterQueryKey } from "./useCharacter";
import {
  useUpdateCharacter,
  type UpdateCharacterInput,
} from "./useUpdateCharacter";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const INPUT: UpdateCharacterInput = {
  name: "Aria",
  values: { concepto: "una vagabunda" },
};

const UPDATED_CHARACTER = {
  id: "char_1",
  name: "Aria",
  ownerId: "usr_demo",
  playbookId: "angel",
  playbookVersion: 1,
  values: { concepto: "una vagabunda" },
  createdAt: "2026-01-15T12:00:00.000Z",
  updatedAt: "2026-01-16T12:00:00.000Z",
  deletedAt: null,
};

function mockUpdateSuccess() {
  server.use(
    http.patch("/characters/:id", () => HttpResponse.json(UPDATED_CHARACTER)),
  );
}

describe("useUpdateCharacter", () => {
  it("hace PATCH /characters/:id con el input y devuelve el personaje actualizado", async () => {
    let receivedUrl: string | undefined;
    let receivedMethod: string | undefined;
    let receivedBody: unknown;
    server.use(
      http.patch("/characters/:id", async ({ request }) => {
        receivedUrl = new URL(request.url).pathname;
        receivedMethod = request.method;
        receivedBody = await request.json();
        return HttpResponse.json(UPDATED_CHARACTER);
      }),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({ id: "char_1", name: "Aria" });
    expect(receivedUrl).toBe("/characters/char_1");
    expect(receivedMethod).toBe("PATCH");
    expect(receivedBody).toEqual(INPUT);
  });

  it("escribe el personaje actualizado en la cache de useCharacter", async () => {
    mockUpdateSuccess();

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(characterQueryKey("char_1"))).toEqual(
      UPDATED_CHARACTER,
    );
  });

  it("invalida el listado de personajes al guardar", async () => {
    mockUpdateSuccess();

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["characters"] });
  });

  it("expone el ApiError cuando el back rechaza (ej. 400 de validación)", async () => {
    server.use(
      http.patch("/characters/:id", () =>
        HttpResponse.json(
          {
            message: "Los datos del personaje no son válidos para el Playbook",
            errors: [{ field: "concepto", message: "concepto es requerido" }],
          },
          { status: 400 },
        ),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({
      status: 400,
      message: "Los datos del personaje no son válidos para el Playbook",
    });
  });

  it("expone el ApiError cuando el personaje no existe (404)", async () => {
    server.use(
      http.patch("/characters/:id", () =>
        HttpResponse.json(
          { message: "Character char_1 no encontrado" },
          { status: 404 },
        ),
      ),
    );

    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(() => useUpdateCharacter("char_1"), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(INPUT);

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toMatchObject({ status: 404 });
  });
});
