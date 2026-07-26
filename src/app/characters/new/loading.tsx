import { QueryLoading } from "@/components/queryState";

/** Loading UI de la ruta `/characters/new` (DEV-76). */
export default function NewCharacterLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
      <QueryLoading label="Cargando…" />
    </div>
  );
}
