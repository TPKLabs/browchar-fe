import { Toast } from "@base-ui/react/toast";

/**
 * Manager global de toasts (Base UI). Vive **fuera** del árbol de React para
 * poder encolar un toast desde cualquier lado —hooks, event handlers o incluso
 * funciones fuera de un componente— sin pasar por contexto. `Toaster`
 * (`components/ui/toast`) lo consume vía la prop `toastManager` del
 * `Toast.Provider`, así todos los toasts se renderizan en el mismo viewport.
 */
export const toastManager = Toast.createToastManager();

/** Variantes soportadas: definen el ícono/color en `Toaster`. */
export type ToastType = "success" | "error" | "info";

export interface ToastOptions {
  /** Texto secundario opcional debajo del título. */
  description?: string;
  /**
   * ms antes del auto-cierre. `0` deja el toast fijo hasta que se cierre a
   * mano. Si se omite, usa el default del `Toast.Provider` (5000ms).
   */
  timeout?: number;
}

function show(type: ToastType, title: string, options?: ToastOptions): string {
  return toastManager.add({
    title,
    description: options?.description,
    // `type` lo usa `Toaster` para elegir ícono/estilo; Base UI lo pasa al DOM.
    type,
    // Los errores se anuncian con urgencia (aria-live assertive) para lectores
    // de pantalla; éxito e info van en modo polite.
    priority: type === "error" ? "high" : "low",
    ...(options?.timeout === undefined ? {} : { timeout: options.timeout }),
  });
}

/**
 * API centralizada de feedback al usuario (DEV-75). Importable desde cualquier
 * feature del front; el render lo hace `Toaster`, montado una sola vez en el
 * layout raíz.
 *
 * @example
 * toast.success("Personaje creado", {
 *   description: "El personaje fue guardado correctamente.",
 * });
 * toast.error("No se pudo crear el personaje", {
 *   description: "Revisá los datos e intentá nuevamente.",
 * });
 * toast.info("Sesión por expirar");
 */
export const toast = {
  success: (title: string, options?: ToastOptions) =>
    show("success", title, options),
  error: (title: string, options?: ToastOptions) =>
    show("error", title, options),
  info: (title: string, options?: ToastOptions) => show("info", title, options),
  /** Cierra un toast por `id`, o todos los abiertos si no se pasa `id`. */
  dismiss: (id?: string) => toastManager.close(id),
};
