import { CharactersListSkeleton } from "@/components/characters/charactersListSkeleton";

/**
 * Loading UI de la ruta `/characters` (DEV-76). El App Router la muestra
 * mientras el segmento navega, así el encabezado aparece al instante y la
 * grilla se completa con placeholders con la misma forma que el listado real.
 */
export default function CharactersLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-semibold tracking-wide">
          Personajes
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Gestioná los personajes que creaste.
        </p>
      </div>
      <CharactersListSkeleton />
    </div>
  );
}
