"use client";

import { QueryEmpty, QueryError, QueryLoading } from "@/components/query-state";
import { usePlaybooks } from "@/lib/playbooks/use-playbooks";
import { PlaybookCard } from "./playbook-card";

interface PlaybooksListProps {
  /** Si viene, filtra los playbooks por juego (server-side, `?gameId=`). */
  gameId?: string;
}

export function PlaybooksList({ gameId }: PlaybooksListProps = {}) {
  const { data: playbooks, isPending, isError } = usePlaybooks(gameId);

  if (isPending) {
    return <QueryLoading label="Cargando playbooks…" />;
  }

  if (isError) {
    return (
      <QueryError label="No se pudieron cargar los playbooks. Intentá de nuevo más tarde." />
    );
  }

  if (playbooks.length === 0) {
    return <QueryEmpty label="No hay playbooks disponibles todavía." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {playbooks.map((playbook) => (
        <PlaybookCard key={playbook.id} playbook={playbook} />
      ))}
    </div>
  );
}
