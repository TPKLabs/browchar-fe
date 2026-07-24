import { describe, expect, it } from "vitest";

import { DELETE_ERROR_MESSAGE } from "./deleteErrorMessage";

describe("DELETE_ERROR_MESSAGE", () => {
  it("es el mensaje genérico de fallo de eliminación", () => {
    expect(DELETE_ERROR_MESSAGE).toBe(
      "No se pudo eliminar el personaje. Intentá de nuevo más tarde.",
    );
  });
});
