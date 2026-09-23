export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

type SuccessEnvelope<T> = {
  success: true
  data: T
}

type ErrorEnvelope = {
  success?: false
  error?: string
  message?: string
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

function readErrorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") {
    return fallback
  }
  const envelope = payload as ErrorEnvelope
  if (typeof envelope.error === "string" && envelope.error.length > 0) {
    return envelope.error
  }
  if (typeof envelope.message === "string" && envelope.message.length > 0) {
    return envelope.message
  }
  return fallback
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
    response.status === 204
      ? null
      : await response.json().catch(() => null)

  if (response.ok && (payload === null || payload === undefined)) {
    return undefined as T
  }

  if (!response.ok) {
    throw new ApiError(
      readErrorMessage(payload, "No pudimos completar la solicitud."),
      response.status
    )
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
    throw new ApiError(
      readErrorMessage(payload, "No pudimos completar la solicitud."),
      response.status
    )
  }

  throw new ApiError("Respuesta inesperada del servidor.", response.status)
}
