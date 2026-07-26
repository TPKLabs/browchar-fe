import { CharacterDetailSkeleton } from "@/components/characters/characterDetailSkeleton";

/**
 * Loading UI de la ruta `/characters/[id]` (DEV-76). Muestra el placeholder del
 * detalle mientras el segmento navega, para no saltar de layout al resolver.
 */
export default function CharacterDetailLoading() {
  return <CharacterDetailSkeleton />;
}
