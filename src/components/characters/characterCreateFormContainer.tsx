"use client";

import { Loader2 } from "lucide-react";

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
      <div
        role="status"
        className="text-muted-foreground mx-auto flex w-full max-w-2xl flex-1 items-center justify-center gap-2 px-4 py-10 text-sm sm:px-6"
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
        className="text-destructive bg-destructive/10 mx-auto mt-10 w-full max-w-2xl rounded-lg p-4 text-sm"
      >
        No se pudieron cargar los playbooks. Intentá de nuevo más tarde.
      </p>
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
