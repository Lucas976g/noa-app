export type Role = "cliente" | "director"

export type AuthUser = {
  id: string
  email: string
  role: Role
}

export const isRole = (value: unknown): value is Role =>
  value === "cliente" || value === "director"

export const homePathForRole = (role: Role): string =>
  role === "director" ? "/admin" : "/catalogo"

export const displayName = (user: Pick<AuthUser, "email">): string => {
  const local = user.email.split("@")[0]?.trim()
  return local && local.length > 0 ? local : user.email
}

export const parseAuthUser = (data: unknown): AuthUser => {
  if (!data || typeof data !== "object") {
    throw new Error("Respuesta inesperada del servidor.")
  }

  const record = data as Record<string, unknown>
  const { id, email, role } = record

  if (typeof id !== "string" || id.length === 0) {
    throw new Error("Respuesta inesperada del servidor.")
  }
  if (typeof email !== "string" || email.length === 0) {
    throw new Error("Respuesta inesperada del servidor.")
  }
  if (!isRole(role)) {
    throw new Error("Rol no reconocido.")
  }

  return { id, email, role }
}
