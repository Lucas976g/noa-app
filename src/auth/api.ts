import { parseAuthUser, type AuthUser } from "@/auth/model"
import { apiFetch } from "@/shared/http/client"

export const loginRequest = async (
  email: string,
  password: string
): Promise<AuthUser> => {
  const data = await apiFetch<unknown>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
  return parseAuthUser(data)
}

export const logoutRequest = async (): Promise<void> => {
  await apiFetch<void>("/auth/logout", { method: "POST" })
}
