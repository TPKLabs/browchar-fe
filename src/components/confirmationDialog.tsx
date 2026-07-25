"use client";

import type { ReactNode } from "react";
import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

interface ConfirmationDialogProps {
  /** Estado controlado de apertura. */
  open: boolean;
  /**
   * Cambio de apertura iniciado por el usuario (botón cancelar, Escape). No se
   * dispara cuando el padre cierra el diálogo programáticamente bajando `open`.
   */
  onOpenChange: (open: boolean) => void;
  /** Título — obligatorio: es el nombre accesible del diálogo. */
  title: string;
  /** Texto explicativo. Debe dejar claro qué se está por confirmar. */
  description?: ReactNode;
  /** Texto del botón de confirmar. Para acciones destructivas, explícito. */
  confirmLabel?: string;
  /** Texto del botón de cancelar. */
  cancelLabel?: string;
  /**
   * Mientras es `true`: el botón de confirmar muestra spinner, ambos botones
   * quedan deshabilitados (evita doble confirmación) y no se puede cerrar el
   * diálogo. Lo controla el padre según su acción async.
   */
  isLoading?: boolean;
  /**
   * Estilo destructivo en el botón de confirmar (rojo). Default `true` porque
   * el caso de uso principal son borrados; pasá `false` para confirmaciones
   * neutrales.
   */
  destructive?: boolean;
  /**
   * Acción a ejecutar al confirmar. El diálogo **no** cierra por sí mismo ni
   * ejecuta nada más: sólo llama esto. El padre decide cerrar (bajando `open`)
   * cuando la acción termina.
   */
  onConfirm: () => void;
  /** Se ejecuta al cancelar (botón cancelar o Escape), antes de cerrar. */
  onCancel?: () => void;
}

/**
 * Diálogo de confirmación reutilizable para acciones destructivas o sensibles
 * (DEV-74). Genérico: no contiene lógica de dominio, sólo ejecuta las funciones
 * recibidas. Construido sobre el `alert-dialog` de Base UI (modal, sin cierre
 * por click afuera: exige una decisión explícita).
 *
 * @example
 * const [open, setOpen] = useState(false);
 * const del = useDeleteCharacter(id);
 * <ConfirmationDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Eliminar personaje"
 *   description={`Esta acción eliminará a ${name}. No se puede deshacer.`}
 *   confirmLabel="Eliminar personaje"
 *   isLoading={del.isPending}
 *   onConfirm={() => del.mutate()}
 * />
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isLoading = false,
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const handleOpenChange = (next: boolean) => {
    // No dejamos cerrar mientras la acción está en curso.
    if (isLoading && !next) return;
    if (!next) onCancel?.();
    onOpenChange(next);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black/50 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialog.Popup
          className={cn(
            "bg-popover text-popover-foreground fixed top-1/2 left-1/2 z-50 flex w-96 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-lg border p-6 shadow-lg",
            "transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-starting-style:scale-[0.98] data-starting-style:opacity-0",
          )}
        >
          <div className="flex flex-col gap-2">
            <AlertDialog.Title className="font-heading text-lg font-semibold tracking-wide">
              {title}
            </AlertDialog.Title>
            {description ? (
              <AlertDialog.Description className="text-muted-foreground text-sm">
                {description}
              </AlertDialog.Description>
            ) : null}
          </div>
          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              variant={destructive ? "destructive" : "default"}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden />
                  {confirmLabel}
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
