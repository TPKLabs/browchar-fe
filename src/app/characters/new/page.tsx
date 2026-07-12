import { CharacterCreateFormContainer } from "@/components/characters/character-create-form-container";

/**
 * Ruta de creación de personaje (DEV-50).
 *
 * Se llega desde el CTA "Crear personaje" (juego + playbook se eligen acá) o
 * con `?playbookId=X` desde una tarjeta de Playbooks, que preselecciona el
 * juego y el playbook. Los playbooks se traen reales vía
 * `CharacterCreateFormContainer` (DEV-160).
 */
export default async function NewCharacterPage({
  searchParams,
}: {
  searchParams: Promise<{ playbookId?: string }>;
}) {
  const { playbookId } = await searchParams;

  return <CharacterCreateFormContainer initialPlaybookId={playbookId} />;
}
