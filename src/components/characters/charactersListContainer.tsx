"use client";

import { useCharacters } from "@/hooks/useCharacters";
import { CharactersList } from "./charactersList";
import { toCharacterSummary } from "./toCharacterSummary";

/**
 * Trae los personajes reales desde `GET /characters` (DEV-60) y delega el
 * render a `CharactersList`, que sigue siendo presentacional (recibe datos y
 * flags por prop). El mapeo a `CharacterSummary` se hace acá para que la lista
 * y sus tests no dependan de la forma cruda de la API.
 */
export function CharactersListContainer() {
  const { data, isPending, isError } = useCharacters();

  const characters = data?.data.map(toCharacterSummary) ?? [];

  return (
    <CharactersList
      characters={characters}
      isPending={isPending}
      isError={isError}
    />
  );
}
