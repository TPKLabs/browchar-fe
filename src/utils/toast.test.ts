import { afterEach, describe, expect, it, vi } from "vitest";

import { toast, toastManager } from "./toast";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("toast", () => {
  it("success encola un toast tipo success con prioridad polite", () => {
    const add = vi.spyOn(toastManager, "add").mockReturnValue("id-1");

    const id = toast.success("Personaje creado", {
      description: "El personaje fue guardado correctamente.",
    });

    expect(id).toBe("id-1");
    expect(add).toHaveBeenCalledWith({
      title: "Personaje creado",
      description: "El personaje fue guardado correctamente.",
      type: "success",
      priority: "low",
    });
  });

  it("error encola un toast tipo error con prioridad alta (assertive)", () => {
    const add = vi.spyOn(toastManager, "add").mockReturnValue("id-2");

    toast.error("No se pudo crear el personaje");

    expect(add).toHaveBeenCalledWith({
      title: "No se pudo crear el personaje",
      description: undefined,
      type: "error",
      priority: "high",
    });
  });

  it("info encola un toast tipo info", () => {
    const add = vi.spyOn(toastManager, "add").mockReturnValue("id-3");

    toast.info("Sesión por expirar");

    expect(add).toHaveBeenCalledWith({
      title: "Sesión por expirar",
      description: undefined,
      type: "info",
      priority: "low",
    });
  });

  it("propaga un timeout explícito y lo omite cuando no se pasa", () => {
    const add = vi.spyOn(toastManager, "add").mockReturnValue("id-4");

    toast.info("Fija", { timeout: 0 });
    expect(add.mock.calls[0]?.[0]).toMatchObject({ timeout: 0 });

    toast.info("Default");
    expect(add.mock.calls[1]?.[0]).not.toHaveProperty("timeout");
  });

  it("dismiss cierra un toast por id, o todos si no se pasa id", () => {
    const close = vi.spyOn(toastManager, "close").mockImplementation(() => {});

    toast.dismiss("id-1");
    expect(close).toHaveBeenCalledWith("id-1");

    toast.dismiss();
    expect(close).toHaveBeenCalledWith(undefined);
  });
});
