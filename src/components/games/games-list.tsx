"use client";

import Link from "next/link";
import { Dices, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useGames } from "@/lib/games/use-games";

export function GamesList() {
  const { data: games, isPending, isError } = useGames();

  if (isPending) {
    return (
      <div
        role="status"
        className="text-muted-foreground flex items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-sm"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Cargando juegos…
      </div>
    );
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="text-destructive bg-destructive/10 rounded-lg p-4 text-sm"
      >
        No se pudieron cargar los juegos. Intentá de nuevo más tarde.
      </p>
    );
  }

  if (games.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
        No hay juegos disponibles todavía.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <Card key={game.id}>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-lg tracking-wide">
              <Dices className="text-primary size-4" aria-hidden />
              {game.name}
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <Button
              className="w-full"
              variant="outline"
              nativeButton={false}
              render={<Link href={`/games/${game.id}`} />}
            >
              Ver playbooks
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
