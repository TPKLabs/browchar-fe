import type { CharacterListItem, CharacterSummary } from "@/types";

/**
 * Adapta un item del listado de la API (`CharacterListItem`) a la vista que
 * consumen las tarjetas (`CharacterSummary`). Recorta los campos crudos que la
 * card no usa (`values`, `ownerId`, `playbookId`, …) y deja `campaignName`
 * indefinido: la API todavía no resuelve la Campaign del personaje (DEV-60), y
 * la card oculta el chip cuando no viene.
 */
export function toCharacterSummary(item: CharacterListItem): CharacterSummary {
  return {
    id: item.id,
    name: item.name,
    playbookName: item.playbookName,
    gameName: item.gameName,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}
