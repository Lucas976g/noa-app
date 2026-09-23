import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { loginRequest, logoutRequest } from "@/auth/api"
import type { AuthUser, Role } from "@/auth/model"
import { isRole } from "@/auth/model"
import { ApiError } from "@/shared/http/client"

type LoginResult = { ok: true; role: Role } | { ok: false; error: string }

type AuthState = {
  user: AuthUser | null
  _hasHydrated: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  setHasHydrated: (value: boolean) => void
}

const INVALID_CREDENTIALS = "Email o contraseña incorrectos."
const GENERIC_ERROR = "No pudimos completar la solicitud."

type LegacyPersistedState = {
  user?: {
    id?: string
    name?: string
    email?: string
    role?: string
  } | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      login: async (email, password) => {
        try {
          const user = await loginRequest(email, password)
          set({ user })
          return { ok: true, role: user.role }
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            return { ok: false, error: INVALID_CREDENTIALS }
          }
          if (error instanceof ApiError) {
            return { ok: false, error: error.message }
          }
          return { ok: false, error: GENERIC_ERROR }
        }
      },
      logout: async () => {
        try {
          await logoutRequest()
        } catch {
          // Clear local session even if the API call fails.
        }
        set({ user: null })
      },
      setHasHydrated: (value) => set({ _hasHydrated: value }),
    }),
    {
      name: "noa-auth",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          const legacy = persistedState as LegacyPersistedState
          const raw = legacy.user
          if (
            raw &&
            typeof raw === "object" &&
            typeof raw.id === "string" &&
            typeof raw.email === "string" &&
            isRole(raw.role)
          ) {
            return {
              ...legacy,
              user: { id: raw.id, email: raw.email, role: raw.role },
            } as AuthState
          }
          return { user: null } as AuthState
        }
        return persistedState as AuthState
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
