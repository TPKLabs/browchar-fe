import { CharacterCreateForm } from "@/components/characters/character-create-form";
import { MOCK_PLAYBOOKS, getMockPlaybook } from "@/lib/mocks/playbooks";

/**
 * Ruta de creación de personaje (DEV-50).
 *
 * Se llega desde el CTA "Crear personaje" (juego + playbook se eligen acá) o
 * con `?playbookId=X` desde una tarjeta de Playbooks, que preselecciona el
 * juego y el playbook. La integración real con la API va en otra subtask.
 */
export default async function NewCharacterPage({
  searchParams,
}: {
  searchParams: Promise<{ playbookId?: string }>;
}) {
  const { playbookId } = await searchParams;
  const initialPlaybook = getMockPlaybook(playbookId);

  return (
    <CharacterCreateForm
      playbooks={MOCK_PLAYBOOKS}
      initialPlaybookId={initialPlaybook?.id}
    />
  );
}
