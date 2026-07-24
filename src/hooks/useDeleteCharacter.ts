import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import { characterQueryKey } from "./useCharacter";

/**
 * Elimina un personaje contra `DELETE /characters/:id` (DEV-52/DEV-71). El
 * back hace borrado lógico (soft-delete) y responde `204 No Content`.
 *
 * Al resolver, saca el detalle de la cache (ya no existe — un refetch daría
 * 404) e invalida el listado (`useCharacters`) para que la tarjeta eliminada
 * desaparezca, mismo criterio que `useUpdateCharacter`.
 */
export function useDeleteCharacter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete<void>(`/characters/${id}`),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: characterQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}
