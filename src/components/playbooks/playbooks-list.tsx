"use client";

import { Loader2 } from "lucide-react";

import { usePlaybooks } from "@/lib/playbooks/use-playbooks";
import { PlaybookCard } from "./playbook-card";

interface PlaybooksListProps {
  /** Si viene, filtra los playbooks por juego (server-side, `?gameId=`). */
  gameId?: string;
}

export function PlaybooksList({ gameId }: PlaybooksListProps = {}) {
  const { data: playbooks, isPending, isError } = usePlaybooks(gameId);

  if (isPending) {
    return (
      <div
        role="status"
        className="text-muted-foreground flex items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-sm"
      >
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Cargando playbooks…
      </div>
    );
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="text-destructive bg-destructive/10 rounded-lg p-4 text-sm"
      >
        No se pudieron cargar los playbooks. Intentá de nuevo más tarde.
      </p>
    );
  }

  if (playbooks.length === 0) {
    return (
      <p className="text-muted-foreground rounded-lg border border-dashed p-10 text-center text-sm">
        No hay playbooks disponibles todavía.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {playbooks.map((playbook) => (
        <PlaybookCard key={playbook.id} playbook={playbook} />
      ))}
    </div>
  );
}
