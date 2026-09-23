export class ApiError extends Error {
  readonly status: number
  readonly code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.code = code
  }
}

type SuccessEnvelope<T> = {
  success: true
  data: T
}

// El backend manda el mismo error en la raíz (code, message) y anidado en
// error (para compatibilidad con clientes viejos). Ya no manda estructuras
// crudas de Zod: en validaciones responde VALIDATION_ERROR con un mensaje
// legible del primer campo inválido.
type ErrorEnvelope = {
  success?: false
  code?: string
  message?: string
  error?: string | { message?: string; code?: string }
}

export function resolveApiUrl(path: string): string {
  if (path.startsWith("http")) return path
  // En desarrollo, usamos rutas relativas para que el proxy de Vite gestione las cookies en localhost
  if (import.meta.env.DEV) {
    return path.startsWith("/") ? path : `/${path}`
  }
  const baseUrl = import.meta.env.VITE_API_URL ?? ""
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
}

function readError(
  payload: unknown,
  fallback: string
): { message: string; code?: string } {
  if (!payload || typeof payload !== "object") {
    return { message: fallback }
  }
  const envelope = payload as ErrorEnvelope
  if (typeof envelope.error === "string" && envelope.error.length > 0) {
    return { message: envelope.error, code: envelope.code }
  }
  if (envelope.error && typeof envelope.error === "object") {
    const message =
      typeof envelope.error.message === "string" &&
      envelope.error.message.length > 0
        ? envelope.error.message
        : undefined
    if (message) {
      return { message, code: envelope.error.code ?? envelope.code }
    }
  }
  if (typeof envelope.message === "string" && envelope.message.length > 0) {
    return { message: envelope.message, code: envelope.code }
  }
  return { message: fallback }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json")
  }

  let response: Response
  try {
    response = await fetch(resolveApiUrl(path), {
      ...init,
      credentials: "include",
      headers,
    })
  } catch {
    throw new ApiError("No pudimos conectar con el servidor.", 0)
  }

  const payload: unknown =
    response.status === 204 ? null : await response.json().catch(() => null)

  if (response.ok && (payload === null || payload === undefined)) {
    return undefined as T
  }

  if (!response.ok) {
    const { message, code } = readError(
      payload,
      "No pudimos completar la solicitud."
    )
    throw new ApiError(message, response.status, code)
  }

  if (Array.isArray(payload)) {
    return payload as T
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as { success: unknown }).success === true
  ) {
    if ("data" in payload) {
      return (payload as SuccessEnvelope<T>).data
    }
    return undefined as T
  }

  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as ErrorEnvelope).success === false
  ) {
    const { message, code } = readError(
      payload,
      "No pudimos completar la solicitud."
    )
    throw new ApiError(message, response.status, code)
  }

  throw new ApiError("Respuesta inesperada del servidor.", response.status)
}
