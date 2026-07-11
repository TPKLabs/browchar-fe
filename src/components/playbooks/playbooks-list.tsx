"use client";

import Link from "next/link";
import { BookOpen, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { usePlaybooks } from "@/lib/playbooks/use-playbooks";

export function PlaybooksList() {
  const { data: playbooks, isPending, isError } = usePlaybooks();

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

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {playbooks.map((playbook) => (
        <Card key={playbook.id}>
          <CardHeader>
            <CardTitle className="font-heading flex items-center gap-2 text-lg tracking-wide">
              <BookOpen className="text-primary size-4" aria-hidden />
              {playbook.name}
            </CardTitle>
            <CardDescription>{playbook.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Badge variant="secondary">{playbook.game.gameName}</Badge>
            <Badge variant="outline">v{playbook.version}</Badge>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              nativeButton={false}
              render={
                <Link href={`/characters/new?playbookId=${playbook.id}`} />
              }
            >
              Crear personaje
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
