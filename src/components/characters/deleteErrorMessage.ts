/**
 * Mensaje para un `DELETE /characters/:id` que falló por un error **no
 * terminal** (500, red caída). Compartido entre `CharacterCard` y
 * `CharacterDetail` — ambos disparan `useDeleteCharacter` y muestran el mismo
 * texto ante el mismo error.
 *
 * Un `404` no llega acá: es terminal (el personaje ya no está) y se reconcilia
 * como éxito — se lo quita de la UI, no se muestra un error. Ver
 * `useDeleteCharacter`.
 */
export const DELETE_ERROR_MESSAGE =
  "No se pudo eliminar el personaje. Intentá de nuevo más tarde.";
