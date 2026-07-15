import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CharactersPaginationProps {
  /** Página actual (1-based). */
  page: number;
  /** Tamaño de página con el que se pidió el listado. */
  pageSize: number;
  /** Total de personajes que matchean (viene en `meta.total`). */
  total: number;
  onPageChange: (page: number) => void;
}

/**
 * Controles de paginación de `/characters` (DEV-60). Presentacional: recibe
 * `page`/`pageSize`/`total` (derivados de `meta`) y notifica el cambio de
 * página por callback; el estado de la página vive en el container.
 */
export function CharactersPagination({
  page,
  pageSize,
  total,
  onPageChange,
}: CharactersPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <nav
      aria-label="Paginación de personajes"
      className="flex items-center justify-between gap-4"
    >
      <p className="text-muted-foreground text-sm">
        Página {page} de {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft data-icon="inline-start" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </nav>
  );
}
