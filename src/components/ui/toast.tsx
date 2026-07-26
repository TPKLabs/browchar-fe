"use client";

import { Toast as ToastPrimitive } from "@base-ui/react/toast";
import {
  CircleAlert,
  CircleCheck,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/utils/cn";
import { toastManager, type ToastType } from "@/utils/toast";

/**
 * Ícono + color de acento por variante (`toast.type`). Un toast sin `type`
 * conocido (p. ej. un `add` crudo) cae en `null` y se renderiza sin ícono.
 */
const ACCENT_BY_TYPE: Record<
  ToastType,
  { Icon: LucideIcon; className: string }
> = {
  success: { Icon: CircleCheck, className: "text-primary" },
  error: { Icon: CircleAlert, className: "text-destructive" },
  info: { Icon: Info, className: "text-muted-foreground" },
};

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager();

  return toasts.map((toast) => {
    const accent = ACCENT_BY_TYPE[toast.type as ToastType] ?? null;
    const Icon = accent?.Icon;

    return (
      <ToastPrimitive.Root
        key={toast.id}
        toast={toast}
        className={cn(
          "[--gap:0.75rem] [--height:var(--toast-frontmost-height,var(--toast-height))] [--offset-y:calc(var(--toast-offset-y)*-1+calc(var(--toast-index)*var(--gap)*-1)+var(--toast-swipe-movement-y))] [--peek:0.75rem] [--scale:calc(max(0,1-(var(--toast-index)*0.1)))] [--shrink:calc(1-var(--scale))]",
          "bg-popover text-popover-foreground absolute right-0 bottom-0 left-auto z-[calc(1000-var(--toast-index))] mr-0 h-[var(--height)] w-full origin-bottom rounded-lg border shadow-lg select-none",
          "[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--toast-swipe-movement-y)-(var(--toast-index)*var(--peek))-(var(--shrink)*var(--height))))_scale(var(--scale))]",
          "after:absolute after:top-full after:left-0 after:h-[calc(var(--gap)+1px)] after:w-full after:content-['']",
          "data-expanded:h-[var(--toast-height)] data-expanded:[transform:translateX(var(--toast-swipe-movement-x))_translateY(calc(var(--offset-y)))]",
          "data-ending-style:opacity-0 data-limited:opacity-0 data-starting-style:[transform:translateY(150%)]",
          "[&[data-ending-style]:not([data-limited]):not([data-swipe-direction])]:[transform:translateY(150%)]",
          "data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))] data-expanded:data-ending-style:data-[swipe-direction=down]:[transform:translateY(calc(var(--toast-swipe-movement-y)+150%))]",
          "data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=left]:[transform:translateX(calc(var(--toast-swipe-movement-x)-150%))_translateY(var(--offset-y))]",
          "data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))] data-expanded:data-ending-style:data-[swipe-direction=right]:[transform:translateX(calc(var(--toast-swipe-movement-x)+150%))_translateY(var(--offset-y))]",
          "data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))] data-expanded:data-ending-style:data-[swipe-direction=up]:[transform:translateY(calc(var(--toast-swipe-movement-y)-150%))]",
          "[transition:transform_0.5s_cubic-bezier(0.22,1,0.36,1),opacity_0.5s,height_0.15s]",
        )}
      >
        <ToastPrimitive.Content className="flex h-full items-start gap-3 overflow-hidden p-3 transition-opacity duration-[250ms] ease-[cubic-bezier(0.22,1,0.36,1)] data-behind:opacity-0 data-expanded:opacity-100">
          {Icon ? (
            <Icon
              className={cn("mt-0.5 size-5 shrink-0", accent?.className)}
              aria-hidden
            />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <ToastPrimitive.Title className="text-sm font-semibold" />
            <ToastPrimitive.Description className="text-muted-foreground text-sm" />
          </div>
          <ToastPrimitive.Close
            aria-label="Cerrar"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring -mt-1 -mr-1 flex size-6 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-2"
          >
            <X className="size-4" aria-hidden />
          </ToastPrimitive.Close>
        </ToastPrimitive.Content>
      </ToastPrimitive.Root>
    );
  });
}

/**
 * Renderer global de toasts (DEV-75). Se monta una única vez en el layout raíz;
 * consume el `toastManager` compartido (`@/utils/toast`) para que un
 * `toast.success(...)` disparado desde cualquier feature aparezca acá. Apilado
 * abajo a la derecha en desktop, ancho completo abajo en mobile.
 *
 * @example
 * // en el layout raíz, dentro de los providers
 * <Toaster />
 * // desde cualquier feature
 * import { toast } from "@/utils/toast";
 * toast.success("Personaje creado");
 */
export function Toaster() {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      <ToastPrimitive.Portal>
        <ToastPrimitive.Viewport className="fixed top-auto right-4 bottom-4 left-4 z-50 mx-auto w-auto sm:left-auto sm:w-[22.5rem]">
          <ToastList />
        </ToastPrimitive.Viewport>
      </ToastPrimitive.Portal>
    </ToastPrimitive.Provider>
  );
}
