"use client";

import { useState } from "react";
import Link from "next/link";
import { Swords, Trash2 } from "lucide-react";

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
import type { CharacterSummary } from "@/types";
import { formatDate, formatRelativeDate } from "@/utils/dates";

/**
 * Tarjeta de un Character. Presentacional: no fetchea, recibe el dato por
 * prop. Misma vista que usa la home en "Tus personajes recientes" (DEV-56):
 * chips de Game/Campaign arriba, `name`, Playbook (hace de raza/clase),
 * fecha de creación (absoluta) y de última edición (relativa a ahora, con la
 * fecha absoluta en el `title` para quien la necesite exacta).
 *
 * No hay botón de editar separado: la edición vive inline en la pantalla de
 * detalle (DEV-51, `CharacterDetail`), detrás de su propio botón "Editar" —
 * no hay una ruta `/characters/:id/edit` distinta.
 *
 * "Eliminar" no pega a ningún backend (no hay `DELETE /characters/:id`
 * todavía): tras confirmar, oculta la card localmente para dejar el
 * affordance/interacción lista para cuando exista esa integración. Si se
 * borran todas las cards de `/characters` así, la pantalla no vuelve al
 * estado vacío real (`CharactersList` no se entera) — aceptable en un stub.
 */
export function CharacterCard({ character }: { character: CharacterSummary }) {
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) return null;

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar a ${character.name}?`)) {
      setIsDeleted(true);
    }
  };

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
        <p title={formatDate(character.updatedAt)}>
          Última edición {formatRelativeDate(character.updatedAt)}
        </p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          className="flex-1"
          variant="outline"
          nativeButton={false}
          render={<Link href={`/characters/${character.id}`} />}
        >
          Ver detalle
        </Button>
        <Button
          variant="destructive"
          size="icon"
          aria-label="Eliminar personaje"
          onClick={handleDelete}
        >
          <Trash2 aria-hidden />
        </Button>
      </CardFooter>
    </Card>
  );
}
