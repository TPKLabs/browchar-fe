import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "./client";

function mockResponse(status: number, body?: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  } as Response;
}

describe("apiClient", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("hace GET contra baseURL + path y devuelve el body parseado", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(mockResponse(200, { id: "1", name: "Marlene" }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiClient.get<{ id: string; name: string }>(
      "/characters/1",
    );

    expect(result).toEqual({ id: "1", name: "Marlene" });
    const [url, init] = fetchMock.mock.calls[0];
    // Vitest no carga `.env.local` (a diferencia de `next dev`/`next build`),
    // así que `NEXT_PUBLIC_API_URL` no está seteada acá y `BASE_URL` cae en
    // "" — por eso se compara contra el path solo, no contra un env real.
    expect(url).toBe("/characters/1");
    expect(init.method).toBe("GET");
    expect(new Headers(init.headers).get("Content-Type")).toBe(
      "application/json",
    );
    expect(init.body).toBeUndefined();
  });

  it("preserva headers pasados como `Headers` o array de tuplas sin perderlos", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(200, {}));
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.get("/characters/1", {
      headers: new Headers({ Authorization: "Bearer token" }),
    });
    await apiClient.get("/characters/1", {
      headers: [["Authorization", "Bearer token"]],
    });

    for (const [, init] of fetchMock.mock.calls) {
      const headers = new Headers(init.headers);
      expect(headers.get("Authorization")).toBe("Bearer token");
      expect(headers.get("Content-Type")).toBe("application/json");
    }
  });

  it("hace POST serializando el body como JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(201, { id: "2" }));
    vi.stubGlobal("fetch", fetchMock);

    await apiClient.post("/characters", {
      name: "Marlene",
      playbookId: "pb-1",
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe(
      JSON.stringify({ name: "Marlene", playbookId: "pb-1" }),
    );
  });

  it("no manda body en requests sin payload (ej. DELETE)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(204));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiClient.delete("/characters/1");

    expect(result).toBeUndefined();
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("DELETE");
    expect(init.body).toBeUndefined();
  });

  it("lanza ApiError con message y errors cuando el back responde 400 de validación", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockResponse(400, {
        message: "Los datos del personaje no son válidos para el Playbook",
        errors: [{ field: "hp", message: "hp es requerido" }],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.post("/characters", {})).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Los datos del personaje no son válidos para el Playbook",
      errors: [{ field: "hp", message: "hp es requerido" }],
    });
  });

  it("usa un mensaje genérico cuando el error no trae `message`", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(500));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/characters/1")).rejects.toMatchObject({
      name: "ApiError",
      status: 500,
      message: "Request failed with status 500",
      errors: undefined,
    });
  });

  it("ApiError es instancia de Error", async () => {
    const fetchMock = vi.fn().mockResolvedValue(mockResponse(404, {}));
    vi.stubGlobal("fetch", fetchMock);

    try {
      await apiClient.get("/characters/nope");
      expect.unreachable("debería haber lanzado ApiError");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect(error).toBeInstanceOf(Error);
    }
  });
});
