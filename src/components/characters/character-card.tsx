import Link from "next/link";
import { Swords } from "lucide-react";

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
import type { CharacterSummary } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

/**
 * Tarjeta de un Character. Presentacional: no fetchea, recibe el dato por
 * prop. Misma vista que usa la home en "Tus personajes recientes" (DEV-56):
 * chips de Game/Campaign arriba, `name`, Playbook (hace de raza/clase) y las
 * fechas de creación/última edición.
 */
export function CharacterCard({ character }: { character: CharacterSummary }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{character.gameName}</Badge>
          {character.campaignName ? (
            <Badge variant="outline">{character.campaignName}</Badge>
          ) : null}
        </div>
        <CardTitle className="font-heading flex items-center gap-2 text-lg tracking-wide">
          <Swords className="text-primary size-4" aria-hidden />
          {character.name}
        </CardTitle>
        <CardDescription>{character.playbookName}</CardDescription>
      </CardHeader>
      <CardContent className="text-muted-foreground flex flex-col gap-1 text-xs">
        <p>Creado el {formatDate(character.createdAt)}</p>
        <p>Última edición el {formatDate(character.updatedAt)}</p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant="outline"
          nativeButton={false}
          render={<Link href={`/characters/${character.id}`} />}
        >
          Ver detalle
        </Button>
      </CardFooter>
    </Card>
  );
}
