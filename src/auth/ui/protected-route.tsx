import type { ReactNode } from "react"
import { Navigate, useLocation, type Location } from "react-router"

import { useAuthStore } from "@/auth/session-store"
import { useAuthHydration } from "@/auth/use-auth-hydration"
import { homePathForRole, type Role } from "@/auth/model"
import { Spinner } from "@/components/ui/spinner"

type ProtectedRouteProps = {
  children: ReactNode
  requiredRole?: Role
}

export function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const hydrated = useAuthHydration()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!hydrated) {
    return (
      <div
        className="flex min-h-svh items-center justify-center"
        role="status"
        aria-label="Cargando sesión"
      >
        <Spinner className="size-6 text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location as Location }} />
    )
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  return <>{children}</>
}
