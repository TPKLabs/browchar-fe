import Link from "next/link";
import { ArrowRight, Dices, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RecentCharacters } from "@/components/characters/recentCharacters";

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

        <RecentCharacters />
      </section>
    </div>
  );
}
