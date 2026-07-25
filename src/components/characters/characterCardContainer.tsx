"use client";

import { useDeleteCharacter } from "@/hooks/useDeleteCharacter";
import type { CharacterSummary } from "@/types";
import { CharacterCard } from "./characterCard";

/**
 * Conecta `CharacterCard` (presentacional) con `useDeleteCharacter`
 * (`DELETE /characters/:id`, DEV-52/DEV-71) — mismo patrón container →
 * presentacional que `CharacterDetailContainer` → `CharacterDetail`. La card no
 * sabe de TanStack Query ni del `QueryClient`; sólo llama `onDelete` y muestra
 * loading/error. El hook hace la reconciliación de cache que desmonta esta card
 * del listado al eliminar con éxito.
 */
export function CharacterCardContainer({
  character,
}: {
  character: CharacterSummary;
}) {
  const deleteCharacter = useDeleteCharacter(character.id);

  return (
    <CharacterCard
      character={character}
      onDelete={() => deleteCharacter.mutateAsync()}
    />
  );
}
