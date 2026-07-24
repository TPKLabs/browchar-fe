import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CharacterDeleteRequestParams,
  CharacterDeleteResponse,
  CharacterListResponse,
} from "@tpklabs/browchar-contracts";

import { ApiError, apiClient } from "@/api/client";
import { characterQueryKey } from "@/hooks/useCharacter";

/**
 * ¿Es una entrada de listado (`{ data, meta }`) y no la de detalle (un
 * `Character` suelto)? Ambas viven bajo la key `["characters", ...]`, así que
 * `setQueriesData({ queryKey: ["characters"] })` matchea las dos y hay que
 * distinguirlas por forma antes de tocar `.data`.
 */
function isCharacterListResponse(
  value: unknown,
): value is CharacterListResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { data?: unknown }).data) &&
    typeof (value as { meta?: unknown }).meta === "object"
  );
}

/**
 * Elimina un personaje contra `DELETE /characters/:id` (DEV-52/DEV-71). El
 * back hace borrado lógico (soft-delete) y responde `204 No Content`.
 *
 * Reconciliación de cache: al resolver saca el personaje de TODAS las páginas
 * cacheadas del listado (`/characters` y "recientes" de la home) de forma
 * síncrona, sin esperar un refetch — así la tarjeta desaparece apenas se
 * confirma y no hace falta estado local (`isDeleted`) que se desincronice de
 * la cache. Después invalida `["characters"]` en segundo plano (sin `await`)
 * para reconciliar el total exacto y el relleno de la página con el server.
 *
 * Un `404` se trata como **éxito terminal**, no como error: `DELETE` es
 * idempotente y un 404 significa que el personaje ya no está — que es
 * justamente el estado buscado. Dejarlo como error mantendría visible una
 * tarjeta que sólo puede volver a dar 404. Un error genuino (500, red) sí se
 * propaga.
 */
export function useDeleteCharacter(id: CharacterDeleteRequestParams["id"]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<CharacterDeleteResponse> => {
      try {
        return await apiClient.delete<CharacterDeleteResponse>(
          `/characters/${id}`,
        );
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return undefined;
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.setQueriesData<CharacterListResponse>(
        { queryKey: ["characters"] },
        (prev) => {
          if (!isCharacterListResponse(prev)) return prev;
          const data = prev.data.filter((character) => character.id !== id);
          if (data.length === prev.data.length) return prev;
          return {
            ...prev,
            data,
            meta: { ...prev.meta, total: Math.max(0, prev.meta.total - 1) },
          };
        },
      );
      queryClient.removeQueries({
        queryKey: characterQueryKey(id),
        exact: true,
      });
      void queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}
