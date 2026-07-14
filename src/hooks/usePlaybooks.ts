import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import type { PlaybookView } from "@/types";

/**
 * `GET /playbooks` acepta un `gameId` opcional (`?gameId=...`) para filtrar
 * server-side (ver `listPlaybooksQuerySchema` en `@tpklabs/browchar-contracts`
 * y `playbooks.service.ts` en browchar-api). Sin `gameId` trae la lista completa.
 */
export function playbooksQueryKey(gameId?: string) {
  return ["playbooks", gameId ?? null] as const;
}

export function usePlaybooks(gameId?: string) {
  return useQuery({
    queryKey: playbooksQueryKey(gameId),
    queryFn: () =>
      apiClient.get<PlaybookView[]>(
        gameId
          ? `/playbooks?gameId=${encodeURIComponent(gameId)}`
          : "/playbooks",
      ),
  });
}
