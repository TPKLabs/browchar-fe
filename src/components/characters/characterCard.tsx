"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Swords, Trash2 } from "lucide-react";

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
import { DELETE_ERROR_MESSAGE } from "./deleteErrorMessage";

interface CharacterCardProps {
  character: CharacterSummary;
  /**
   * Seam para la integración con `DELETE /characters/:id` (DEV-52/DEV-71). La
   * integración real la conecta `CharacterCardContainer` vía
   * `useDeleteCharacter`; por defecto es un stub que simula latencia y resuelve
   * OK, así la card se puede previsualizar/testear aislada del data layer
   * (mismo patrón que `CharacterDetail`).
   */
  onDelete?: () => Promise<void>;
}

async function stubDelete(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 600));
}

/**
 * Tarjeta de un Character. Presentacional: no fetchea, recibe el dato por prop
 * y delega el borrado en `onDelete`. Misma vista que usa la home en "Tus
 * personajes recientes" (DEV-56): chips de Game/Campaign arriba, `name`,
 * Playbook (hace de raza/clase), fecha de creación (absoluta) y de última
 * edición (relativa a ahora, con la fecha absoluta en el `title` para quien la
 * necesite exacta).
 *
 * No hay botón de editar separado: la edición vive inline en la pantalla de
 * detalle (DEV-51, `CharacterDetail`) — no hay una ruta `/characters/:id/edit`.
 *
 * "Eliminar" pide confirmación y llama a `onDelete`. Mientras está en curso, el
 * botón pasa a spinner y tanto él como "Ver detalle" quedan deshabilitados
 * (`isDeletingRef` corta un doble clic de forma síncrona, antes de que React
 * re-renderice con `isDeleting`). La card **no** se auto-oculta: al eliminar
 * con éxito, `useDeleteCharacter` saca al personaje de la cache del listado y
 * el padre la desmonta — no hay estado local que se desincronice. Ante un
 * error genuino (no 404, que es éxito terminal) se muestra el mensaje inline y
 * la card sigue usable.
 */
export function CharacterCard({
  character,
  onDelete = stubDelete,
}: CharacterCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const isDeletingRef = useRef(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (isDeletingRef.current) return;
    if (!window.confirm(`¿Eliminar a ${character.name}?`)) return;

    isDeletingRef.current = true;
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await onDelete();
      // Éxito: no tocamos estado local — el padre desmonta esta card cuando el
      // personaje sale de la cache del listado (ver `useDeleteCharacter`).
    } catch {
      isDeletingRef.current = false;
      setIsDeleting(false);
      setDeleteError(DELETE_ERROR_MESSAGE);
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
      <CardFooter className="flex-col items-stretch gap-2">
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant="outline"
            nativeButton={false}
            disabled={isDeleting}
            render={<Link href={`/characters/${character.id}`} />}
          >
            Ver detalle
          </Button>
          <Button
            variant="destructive"
            size="icon"
            aria-label="Eliminar personaje"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <Trash2 aria-hidden />
            )}
          </Button>
        </div>
        {deleteError ? (
          <p role="alert" className="text-destructive text-xs">
            {deleteError}
          </p>
        ) : null}
      </CardFooter>
    </Card>
  );
}
