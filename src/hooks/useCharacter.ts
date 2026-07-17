import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import type { CharacterGetResponse } from "@tpklabs/browchar-contracts";

/**
 * `GET /characters/:id` — detalle (DEV-63). Respeta soft-delete (404 si el
 * personaje no existe o está borrado); la validación de ownership llega en
 * DEV-64, todavía bloqueada por auth (DEV-5).
 */
export function characterQueryKey(id: string) {
  return ["characters", id] as const;
}

export function useCharacter(id: string) {
  return useQuery({
    queryKey: characterQueryKey(id),
    queryFn: () => apiClient.get<CharacterGetResponse>(`/characters/${id}`),
    // Sin reintentos: es un fetch único post-navegación, no algo que se
    // resuelva solo reintentando (un 404 nunca lo hace; el default de
    // TanStack Query de 3 reintentos con backoff solo demora ~7s el mensaje
    // de error sin cambiar el resultado). Ante un error transitorio, la
    // usuaria puede recargar.
    retry: false,
  });
}
