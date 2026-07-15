"use client";

import { Card, CardContent } from "@/components/ui/card";
import { QueryError, QueryLoading } from "@/components/queryState";
import { useCharacters } from "@/hooks/useCharacters";
import { CharacterCard } from "./characterCard";
import { toCharacterSummary } from "./toCharacterSummary";

/** Cuántos personajes recientes muestra la home. */
const RECENT_LIMIT = 3;

/**
 * "Tus personajes recientes" de la home: trae los personajes reales desde
 * `GET /characters` (DEV-60, ordenados por `updatedAt` desc en la API — los
 * últimos en uso primero) y muestra los primeros {@link RECENT_LIMIT}, que ya
 * es el `pageSize` que se pide. Comparte la fuente con `/characters`, así ambas
 * pantallas nunca divergen.
 *
 * Sólo renderiza el bloque de datos (grilla / carga / error / vacío); el
 * encabezado y el "Ver todos" viven en la page para mantenerla server-side.
 */
export function RecentCharacters() {
  const { data, isPending, isError } = useCharacters({
    pageSize: RECENT_LIMIT,
  });

  if (isPending) {
    return <QueryLoading label="Cargando personajes…" />;
  }

  if (isError) {
    return (
      <QueryError label="No se pudieron cargar los personajes. Intentá de nuevo más tarde." />
    );
  }

  const characters = (data?.data ?? []).map(toCharacterSummary);

  if (characters.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground py-10 text-center text-sm">
          Todavía no creaste ningún personaje. Elegí un playbook para empezar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {characters.map((character) => (
        <CharacterCard key={character.id} character={character} />
      ))}
    </div>
  );
}
