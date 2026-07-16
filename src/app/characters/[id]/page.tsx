import { CharacterDetailContainer } from "@/components/characters/characterDetailContainer";

/**
 * Detalle de un personaje (`/characters/:id`, DEV-51). Se llega desde el
 * listado (`/characters`). `CharacterDetailContainer` resuelve el personaje
 * (`GET /characters/:id`) y su Playbook.
 */
export default async function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CharacterDetailContainer characterId={id} />;
}
