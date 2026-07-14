import { useMutation } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import type { CharacterView, CreateCharacterInput } from "@/types";

/**
 * Crea un personaje contra `POST /characters` (DEV-47/DEV-48).
 *
 * En error, `apiClient` lanza `ApiError` (con `status` y, en un 400 de
 * validación, `errors`), que el consumidor puede mostrar. No invalida ninguna
 * query porque todavía no hay listado de personajes cacheado (DEV-24).
 */
export function useCreateCharacter() {
  return useMutation({
    mutationFn: (input: CreateCharacterInput) =>
      apiClient.post<CharacterView>("/characters", input),
  });
}
