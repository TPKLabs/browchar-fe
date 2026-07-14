import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CharactersList } from "@/components/characters/charactersList";
import { SAMPLE_CHARACTERS } from "@/mocks/sampleCharacters";

/**
 * Pantalla de listado de personajes (DEV-56).
 *
 * Estructura visual solamente: los personajes de acá abajo son de ejemplo
 * (`SAMPLE_CHARACTERS`, compartidos con la home para que ambas pantallas
 * muestren siempre los mismos personajes). La integración real con
 * `GET /characters` es DEV-60 — cuando esté lista, este stub se reemplaza
 * por un hook (`useCharacters`) que le pasa `characters`/`isPending`/
 * `isError` a `CharactersList` sin tocar el componente visual.
 */
export default function CharactersPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-semibold tracking-wide">
            Personajes
          </h1>
          <p className="text-muted-foreground max-w-2xl text-base">
            Gestioná los personajes que creaste.
          </p>
        </div>
        <Button nativeButton={false} render={<Link href="/characters/new" />}>
          Crear personaje
        </Button>
      </div>

      <CharactersList
        characters={SAMPLE_CHARACTERS}
        isPending={false}
        isError={false}
      />
    </div>
  );
}
