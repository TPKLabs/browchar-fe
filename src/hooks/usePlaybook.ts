import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import type { PlaybookView } from "@/types";

/**
 * `GET /playbooks/:id` — un Playbook puntual (nombre, juego, `template`).
 * Lo usa el detalle de Character (DEV-51) para resolver el nombre del
 * Playbook/juego y etiquetar los `values` dinámicos según el template
 * vigente. `enabled` permite diferir el fetch hasta tener el `playbookId`
 * (ej. una vez resuelto `useCharacter`).
 */
export function playbookQueryKey(id: string) {
  return ["playbooks", "detail", id] as const;
}

export function usePlaybook(id: string, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: playbookQueryKey(id),
    queryFn: () => apiClient.get<PlaybookView>(`/playbooks/${id}`),
    enabled: enabled && Boolean(id),
    // Ver el mismo comentario en `useCharacter`: sin reintentos.
    retry: false,
  });
}
