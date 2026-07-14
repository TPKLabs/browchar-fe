"use client";

import Link from "next/link";
import { Dices } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryEmpty, QueryError, QueryLoading } from "@/components/queryState";
import { useGames } from "@/hooks/useGames";

export function GamesList() {
  const { data: games, isPending, isError } = useGames();

  if (isPending) {
    return <QueryLoading label="Cargando juegos…" />;
  }

  if (isError) {
    return (
      <QueryError label="No se pudieron cargar los juegos. Intentá de nuevo más tarde." />
    );
  }

  if (games.length === 0) {
    return <QueryEmpty label="No hay juegos disponibles todavía." />;
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
