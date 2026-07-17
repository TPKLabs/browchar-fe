import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateCharacterInput as UpdateCharacterContract } from "@tpklabs/browchar-contracts";

import { apiClient } from "@/api/client";
import type { CharacterView } from "@/types";
import { characterQueryKey } from "./useCharacter";

/**
 * Payload de `PATCH /characters/:id` (DEV-68), derivado del contrato
 * compartido (DEV-202): el schema admite update parcial (campos opcionales),
 * pero este front siempre manda el objeto completo porque el back reemplaza
 * `values` wholesale (DEV-67) — de ahí el `Required`. Si el contrato renombra
 * o quita un campo, esto deja de compilar en vez de romper en runtime.
 */
export type UpdateCharacterInput = Required<UpdateCharacterContract>;

/**
 * Actualiza un personaje contra `PATCH /characters/:id` (DEV-68). El back
 * revalida `values` completo contra el template del Playbook (DEV-67), así
 * que el caller siempre manda el objeto entero, no un diff.
 *
 * Al resolver, escribe la respuesta directo en la cache de `useCharacter`
 * (`characterQueryKey`) — ya viene con el personaje actualizado completo, no
 * hace falta invalidar y esperar un refetch — e invalida el listado
 * (`useCharacters`) para que las tarjetas reflejen el nombre nuevo.
 */
export function useUpdateCharacter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCharacterInput) =>
      apiClient.patch<CharacterView>(`/characters/${id}`, input),
    onSuccess: (character) => {
      queryClient.setQueryData(characterQueryKey(id), character);
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });
}
