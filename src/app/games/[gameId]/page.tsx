import { GamePlaybooks } from "@/components/games/gamePlaybooks";

/**
 * Playbooks de un juego (`/games/:gameId`). Se llega desde el listado de juegos.
 * El detalle (nombre del juego + playbooks filtrados) lo resuelve `GamePlaybooks`.
 */
export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;

  return <GamePlaybooks gameId={gameId} />;
}
