import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Placeholder con la forma del detalle de personaje (DEV-76). Se usa mientras
 * `GET /characters/:id` (+ su playbook) está pendiente y en el `loading.tsx` de
 * la ruta, para no saltar de layout al resolver. Sigue el armado de
 * `CharacterDetail`: barra superior con acciones y una card con los campos.
 */
export function CharacterDetailSkeleton() {
  return (
    <div
      role="status"
      aria-label="Cargando personaje"
      className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Skeleton className="h-8 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      <Card>
        <CardHeader className="gap-3">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-3 w-48" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
        </CardContent>
      </Card>

      <span className="sr-only">Cargando personaje…</span>
    </div>
  );
}
