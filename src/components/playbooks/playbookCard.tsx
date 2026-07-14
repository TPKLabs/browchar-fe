import Link from "next/link";
import { BookOpen } from "lucide-react";

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
import type { PlaybookView } from "@/types";

/** Tarjeta de un Playbook. Presentacional: no fetchea, recibe el dato por prop. */
export function PlaybookCard({ playbook }: { playbook: PlaybookView }) {
  return (
    <Card>
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
          render={<Link href={`/characters/new?playbookId=${playbook.id}`} />}
        >
          Crear personaje
        </Button>
      </CardFooter>
    </Card>
  );
}
