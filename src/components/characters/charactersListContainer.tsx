"use client";

import { useState } from "react";

import { useCharacters } from "@/hooks/useCharacters";
import { CharactersList } from "./charactersList";
import { CharactersPagination } from "./charactersPagination";
import { toCharacterSummary } from "./toCharacterSummary";

/**
 * Trae los personajes reales desde `GET /characters` (DEV-60) y delega el
 * render a `CharactersList`, que sigue siendo presentacional (recibe datos y
 * flags por prop). El mapeo a `CharacterSummary` se hace acá para que la lista
 * y sus tests no dependan de la forma cruda de la API.
 *
 * La página vive en estado local y se usa `meta` para renderizar los controles
 * de paginación sólo cuando hay más de una página. El hook mantiene los datos
 * previos entre páginas (`keepPreviousData`), así no parpadea a "cargando".
 */
export function CharactersListContainer() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useCharacters({ page });

  const characters = (data?.data ?? []).map(toCharacterSummary);
  const meta = data?.meta;
  const showPagination = meta !== undefined && meta.total > meta.pageSize;

  return (
    <div className="flex flex-col gap-6">
      <CharactersList
        characters={characters}
        isPending={isPending}
        isError={isError}
      />
      {showPagination ? (
        <CharactersPagination
          page={page}
          pageSize={meta.pageSize}
          total={meta.total}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  );
}
