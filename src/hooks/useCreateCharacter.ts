import { useMutation } from "@tanstack/react-query";

import { apiClient, isValidationError } from "@/api/client";
import { toast } from "@/utils/toast";
import type {
  CharacterCreateRequestBody,
  CharacterCreateResponse,
} from "@tpklabs/browchar-contracts";

/**
 * Crea un personaje contra `POST /characters` (DEV-47/DEV-48).
 *
 * En error, `apiClient` lanza `ApiError` (con `status` y, en un 400 de
 * validación, `errors`), que el consumidor puede mostrar. No invalida ninguna
 * query porque todavía no hay listado de personajes cacheado (DEV-24).
 *
 * Feedback global por toast (DEV-75): éxito siempre; en error, solo los
 * genéricos (red/500) — las validaciones (400 con `errors`) las muestra el form
 * inline campo por campo, así que ahí se omite el toast.
 */
export function useCreateCharacter() {
  return useMutation({
    mutationFn: (input: CharacterCreateRequestBody) =>
      apiClient.post<CharacterCreateResponse>("/characters", input),
    onSuccess: () => {
      toast.success("Personaje creado");
    },
    onError: (error) => {
      if (isValidationError(error)) return;
      toast.error("No se pudo crear el personaje");
    },
  });
}
