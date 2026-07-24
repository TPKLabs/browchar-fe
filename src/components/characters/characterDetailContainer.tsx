"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";
import { QueryError, QueryLoading } from "@/components/queryState";
import { useCharacter } from "@/hooks/useCharacter";
import { useDeleteCharacter } from "@/hooks/useDeleteCharacter";
import { usePlaybook } from "@/hooks/usePlaybook";
import { useUpdateCharacter } from "@/hooks/useUpdateCharacter";
import type { CharacterFormValues } from "@/schemas/characterSchema";
import { CharacterDetail } from "./characterDetail";

interface CharacterDetailContainerProps {
  characterId: string;
}

function BackLink() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="self-start"
      nativeButton={false}
      render={<Link href="/characters" />}
    >
      <ArrowLeft data-icon="inline-start" />
      Personajes
    </Button>
  );
}

/**
 * Trae el personaje real vía `GET /characters/:id` (DEV-63) y, una vez
 * resuelto, su Playbook (`GET /playbooks/:id`) para poder etiquetar los
 * `values` con el `template` vigente. Delega el render a `CharacterDetail`,
 * que sigue siendo presentacional — acá se conecta `onSave` a
 * `useUpdateCharacter` (`PATCH /characters/:id`, DEV-68) y `onDelete` a
 * `useDeleteCharacter` (`DELETE /characters/:id`, DEV-71/DEV-52);
 * `CharacterDetail` solo sabe llamar los callbacks y mostrar loading/error, no
 * de dónde salen.
 *
 * El 404 de `useCharacter` (personaje inexistente o soft-deleted, ver
 * `characters.service.ts` en browchar-api) se distingue de otros errores
 * para mostrar un mensaje específico en vez del genérico de `QueryError`.
 * La validación de ownership (DEV-64) queda pendiente hasta que exista auth
 * (DEV-5): hoy cualquiera puede ver o editar el detalle de cualquier
 * personaje.
 */
export function CharacterDetailContainer({
  characterId,
}: CharacterDetailContainerProps) {
  const character = useCharacter(characterId);
  const playbook = usePlaybook(character.data?.playbookId ?? "", {
    enabled: character.isSuccess,
  });
  const updateCharacter = useUpdateCharacter(characterId);
  const deleteCharacter = useDeleteCharacter(characterId);

  const handleSave = async (values: CharacterFormValues) => {
    await updateCharacter.mutateAsync(values);
  };

  const handleDelete = async () => {
    await deleteCharacter.mutateAsync();
  };

  if (character.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <BackLink />
        <QueryLoading label="Cargando personaje…" />
      </div>
    );
  }

  if (character.isError) {
    const notFound =
      character.error instanceof ApiError && character.error.status === 404;
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <BackLink />
        <QueryError
          label={
            notFound
              ? "Este personaje no existe o fue eliminado."
              : "No se pudo cargar el personaje. Intentá de nuevo más tarde."
          }
        />
      </div>
    );
  }

  if (playbook.isPending) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <BackLink />
        <QueryLoading label="Cargando personaje…" />
      </div>
    );
  }

  if (playbook.isError) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
        <BackLink />
        <QueryError label="No se pudo cargar el personaje. Intentá de nuevo más tarde." />
      </div>
    );
  }

  return (
    <CharacterDetail
      character={character.data}
      playbook={playbook.data}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}
