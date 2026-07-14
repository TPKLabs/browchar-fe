import Link from "next/link";
import { ArrowRight, Dices, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CharacterCard } from "@/components/characters/character-card";
import { SAMPLE_CHARACTERS } from "@/lib/mocks/sample-characters";

/**
 * Placeholder hasta que exista el feature de Characters (hook + api module,
 * ver skill add-feature). El back todavía no expone "personajes recientes"
 * resuelto con nombre de playbook, game y campaign. Usa los primeros N de
 * `SAMPLE_CHARACTERS` (mismos datos que `/characters`, DEV-56) para que ambas
 * pantallas nunca diverjan.
 */
const RECENT_CHARACTERS = SAMPLE_CHARACTERS.slice(0, 3);

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <section className="flex flex-col gap-3">
        <h1 className="font-heading text-foreground text-3xl font-semibold tracking-wide sm:text-4xl">
          Bienvenido de nuevo, aventurero
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Retomá donde dejaste tus personajes o explorá los juegos disponibles
          para armar uno nuevo.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/characters/new" />}
          >
            <Plus data-icon="inline-start" />
            Crear personaje
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={<Link href="/games" />}
          >
            <Dices data-icon="inline-start" />
            Ver juegos
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-semibold tracking-wide">
            Tus personajes recientes
          </h2>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={<Link href="/characters" />}
          >
            Ver todos
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        {RECENT_CHARACTERS.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-10 text-center text-sm">
              Todavía no creaste ningún personaje. Elegí un playbook para
              empezar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {RECENT_CHARACTERS.map((character) => (
              <CharacterCard key={character.id} character={character} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
