"use client";

import { QueryError, QueryLoading } from "@/components/queryState";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { useCreateCharacter } from "@/hooks/useCreateCharacter";
import { CharacterCreateForm } from "./characterCreateForm";

interface CharacterCreateFormContainerProps {
  initialPlaybookId?: string;
}

/**
 * Trae los playbooks reales (DEV-160) y delega el render del form a
 * `CharacterCreateForm`, que sigue recibiendo `playbooks` por prop para no
 * perder su testeabilidad (se testea con datos fijos, sin red).
 */
export function CharacterCreateFormContainer({
  initialPlaybookId,
}: CharacterCreateFormContainerProps) {
  const { data: playbooks, isPending, isError } = usePlaybooks();
  const createCharacter = useCreateCharacter();

  if (isPending) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <QueryLoading label="Cargando playbooks…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
        <QueryError label="No se pudieron cargar los playbooks. Intentá de nuevo más tarde." />
      </div>
    );
  }

  return (
    <CharacterCreateForm
      playbooks={playbooks}
      initialPlaybookId={initialPlaybookId}
      // `mutateAsync` rechaza con `ApiError` en fallo; el form lo captura y
      // muestra su estado de error. Resuelve con el Character creado (DEV-55):
      // el form usa su `id` para el link "Ver personaje" al detalle (DEV-51).
      onSubmit={(input) => createCharacter.mutateAsync(input)}
    />
  );
}
