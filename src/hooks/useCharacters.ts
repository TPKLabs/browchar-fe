import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiClient } from "@/api/client";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/types";
import type { CharacterListResponse } from "@tpklabs/browchar-contracts";

/**
 * `GET /characters` — listado paginado (DEV-60). Devuelve el envelope
 * `data`/`meta`; cada item viene enriquecido con `playbookName`/`gameName`
 * resueltos por la API, así las tarjetas no cruzan `usePlaybooks` a mano.
 *
 * La paginación es opcional: sin args pega a la primera página con el tamaño
 * por defecto (mismos defaults que el back).
 */
export interface UseCharactersParams {
  page?: number;
  pageSize?: number;
}

export function charactersQueryKey({
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGE_SIZE,
}: UseCharactersParams = {}) {
  return ["characters", { page, pageSize }] as const;
}

export function useCharacters(params: UseCharactersParams = {}) {
  const { page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE } = params;

  return useQuery({
    queryKey: charactersQueryKey({ page, pageSize }),
    queryFn: () =>
      apiClient.get<CharacterListResponse>(
        `/characters?page=${page}&pageSize=${pageSize}`,
      ),
    // Al cambiar de página mantené los datos previos visibles mientras llega la
    // nueva, así la lista y los controles de paginación no parpadean a "cargando".
    placeholderData: keepPreviousData,
  });
}
