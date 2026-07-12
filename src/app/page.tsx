import Link from "next/link";
import { Dices, Plus, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Placeholder hasta que exista el feature de Characters (hook + api module,
 * ver skill add-feature). El back todavía no expone "personajes recientes"
 * resuelto con nombre de playbook.
 */
const RECENT_CHARACTERS = [
  {
    id: "1",
    name: "Kaelith Duskbane",
    playbookName: "Guerrero",
    gameName: "D&D 5e",
  },
  {
    id: "2",
    name: "Voss Ironhollow",
    playbookName: "Clérigo",
    gameName: "D&D 5e",
  },
  {
    id: "3",
    name: "Nyra Emberfall",
    playbookName: "Piromante",
    gameName: "Pathfinder",
  },
];

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
              <Card key={character.id}>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2 text-lg tracking-wide">
                    <Swords className="text-primary size-4" aria-hidden />
                    {character.name}
                  </CardTitle>
                  <CardDescription>{character.playbookName}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Badge variant="secondary">{character.gameName}</Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
