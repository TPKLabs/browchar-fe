import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import type { Game } from "@/types";

/**
 * Lista de juegos disponibles.
 *
 * ⚠️ Pega a `GET /games`, que browchar-api todavía NO implementa (ver
 * `game.types.ts` y la nota del CHANGELOG). Mientras no exista, la query va a
 * fallar y los consumidores muestran su estado de error — el front queda listo
 * para cuando la pegada esté.
 */
export const gamesQueryKey = ["games"] as const;

export function useGames() {
  return useQuery({
    queryKey: gamesQueryKey,
    queryFn: () => apiClient.get<Game[]>("/games"),
  });
}
