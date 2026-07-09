import type { ValidationError } from "@/lib/types";

/**
 * Cliente HTTP base (DEV-82).
 *
 * Envuelve `fetch` con baseURL, headers por defecto, serialización JSON y
 * manejo de errores uniforme, para que `charactersApi` (y los módulos que
 * sigan: Playbooks, Campaigns, Auth) no repitan esta configuración.
 *
 * Manejo de token: todavía no hay auth (DEV-5); el hook queda en
 * `buildHeaders` para agregar `Authorization` el día que exista sesión, sin
 * tocar los call sites.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Error de una request HTTP no exitosa (status fuera de 2xx).
 *
 * `errors` viene poblado cuando el back responde el envelope de validación
 * `{ message, errors: ValidationError[] }` (ver `character.types.ts` /
 * `characters.service.ts` en browchar-api); queda `undefined` para errores
 * genéricos (404, 500, etc.).
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errors?: ValidationError[];

  constructor(status: number, message: string, errors?: ValidationError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

function buildHeaders(headers?: HeadersInit): HeadersInit {
  // `new Headers(...)` normaliza los tres shapes válidos de `HeadersInit`
  // (Record, `Headers`, `[string, string][]`); un spread (`{ ...headers }`)
  // solo funciona con el primero y silenciosamente pierde headers con los
  // otros dos (ej. una `Authorization` seteada vía `new Headers(...)`).
  const merged = new Headers(headers);
  if (!merged.has("Content-Type")) {
    merged.set("Content-Type", "application/json");
  }
  // Auth (DEV-5, TBD): agregar Authorization acá cuando exista token de sesión.
  return merged;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    // Respuesta no-JSON (ej. error de proxy/gateway): se devuelve como texto
    // plano para no perder información en el mensaje de ApiError.
    return text;
  }
}

async function request<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders(headers),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const data = await parseBody(res);

  if (!res.ok) {
    const message =
      isRecord(data) && typeof data.message === "string"
        ? data.message
        : `Request failed with status ${res.status}`;
    const errors =
      isRecord(data) && Array.isArray(data.errors)
        ? (data.errors as ValidationError[])
        : undefined;
    throw new ApiError(res.status, message, errors);
  }

  return data as T;
}

/** Cliente HTTP compartido. Los módulos de dominio (ej. `charactersApi`) lo usan en vez de llamar `fetch` directo. */
export const apiClient = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
