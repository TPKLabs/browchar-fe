import { QueryLoading } from "@/components/queryState";

/** Loading UI de la ruta `/playbooks` (DEV-76). */
export default function PlaybooksLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
      <QueryLoading label="Cargando playbooks…" />
    </div>
  );
}
