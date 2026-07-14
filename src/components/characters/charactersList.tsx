import { QueryEmpty, QueryError, QueryLoading } from "@/components/queryState";
import type { CharacterSummary } from "@/types";
import { CharacterCard } from "./characterCard";

interface CharactersListProps {
  characters: CharacterSummary[];
  isPending: boolean;
  isError: boolean;
}

/**
 * Lista de Characters. Presentacional: recibe los datos y sus flags de query
 * por prop (mismo contrato que devuelve `useQuery`) en vez de fetchear —
 * DEV-56 solo arma la estructura visual, la integración real con
 * `GET /characters` es DEV-60.
 */
export function CharactersList({
  characters,
  isPending,
  isError,
}: CharactersListProps) {
  if (isPending) {
    return <QueryLoading label="Cargando personajes…" />;
  }

  if (isError) {
    return (
      <QueryError label="No se pudieron cargar los personajes. Intentá de nuevo más tarde." />
    );
  }

  if (characters.length === 0) {
    return <QueryEmpty label="Todavía no creaste ningún personaje." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </div>
  );
}
