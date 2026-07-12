/**
 * Vista de Game esperada de `GET /games`.
 *
 * ⚠️ Endpoint pendiente: al día de hoy browchar-api NO expone `GET /games`
 * (sólo existe el modelo Prisma `Game` con `id, systemId, key, name, createdAt`
 * y `Playbook.game` embebido en `GET /playbooks`). Esta forma es el contrato
 * asumido para cuando la pegada exista; si el back devuelve otra cosa, ajustar
 * acá. Ver `useGames` y la nota en el CHANGELOG (Future Considerations).
 */
export interface Game {
  id: string;
  name: string;
}
