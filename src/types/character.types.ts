/**
 * Tipos de dominio — Character.
 *
 * DEV-197: TODOS los tipos de request y response viven en
 * `@tpklabs/browchar-contracts` como wire shapes (fechas string ISO, la forma
 * real del JSON) bajo la convención `<Entidad><Operación>{Response,
 * RequestBody,RequestParams}`. Acá solo quedan re-exports por compatibilidad
 * de imports (`@/types`) y `CharacterSummary`, que es una vista derivada
 * solo-FE para tarjetas — no un contrato de API.
 */
export type {
  Character,
  CharacterListItem,
  CharacterListRequestParams,
  CharacterListResponse,
  CharacterGetResponse,
  CharacterCreateRequestBody,
  CharacterCreateResponse,
  CharacterUpdateRequestBody,
  CharacterUpdateResponse,
  ValidationError,
} from "@tpklabs/browchar-contracts";

/**
 * Alias histórico del front para la fila cruda de Character
 * (`POST /characters`, `GET /characters/:id`). Código nuevo usa los nombres
 * por endpoint (`CharacterGetResponse`, etc.) directo del paquete.
 */
export type { CharacterGetResponse as CharacterView } from "@tpklabs/browchar-contracts";

/**
 * Vista resumida de un Character para tarjetas de listado (home "Tus
 * personajes recientes" y `/characters`, DEV-56): nombre, Playbook (hace de
 * "raza/clase"), Game y, si el personaje está en alguna, Campaign.
 *
 * Solo-FE: se deriva de `CharacterListItem` vía `toCharacterSummary`, no es
 * una response de la API.
 */
export interface CharacterSummary {
  id: string;
  name: string;
  playbookName: string;
  gameName: string;
  /** Ausente si el personaje no participa de ninguna Campaign. */
  campaignName?: string;
  /** ISO 8601, igual que `Character.createdAt`/`updatedAt`. */
  createdAt: string;
  updatedAt: string;
}
