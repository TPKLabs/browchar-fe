import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder con forma de `CharacterCard` para el estado de carga (DEV-76). */
function CharacterCardSkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-1 h-6 w-40" />
        <Skeleton className="h-4 w-28" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-36" />
      </CardContent>
      <CardFooter className="gap-2">
        <Skeleton className="h-8 flex-1" />
        <Skeleton className="size-8" />
      </CardFooter>
    </Card>
  );
}

/**
 * Grilla de placeholders para el listado de personajes (DEV-76). Reemplaza al
 * spinner genérico mientras `GET /characters` está pendiente y en el
 * `loading.tsx` de la ruta, para que la transición no cambie de layout. La
 * grilla coincide con la de `CharactersList`/`RecentCharacters`.
 */
export function CharactersListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando personajes"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }, (_, index) => (
        <CharacterCardSkeleton key={index} />
      ))}
      <span className="sr-only">Cargando personajes…</span>
    </div>
  );
}
