"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useGames } from "@/hooks/useGames";
import { PlaybooksList } from "@/components/playbooks/playbooksList";

/**
 * Vista de un juego: encabezado con su nombre + los playbooks de ese juego.
 * El nombre sale de `useGames` (robusto incluso si el juego no tiene playbooks);
 * la lista la resuelve `PlaybooksList` filtrando por `gameId`.
 */
export function GamePlaybooks({ gameId }: { gameId: string }) {
  const { data: games } = useGames();
  const gameName = games?.find((game) => game.id === gameId)?.name;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="self-start"
          nativeButton={false}
          render={<Link href="/games" />}
        >
          <ArrowLeft data-icon="inline-start" />
          Juegos
        </Button>
        <h1 className="font-heading text-3xl font-semibold tracking-wide">
          {gameName ?? "Playbooks"}
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Elegí un playbook de este juego para crear un personaje.
        </p>
      </div>

      <PlaybooksList gameId={gameId} />
    </div>
  );
}
