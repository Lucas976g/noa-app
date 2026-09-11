import { useEffect } from "react"
import { Link, Navigate, useLocation, type Location } from "react-router"
import { IconBuildingWarehouse } from "@tabler/icons-react"

import { LoginForm } from "@/auth/ui/login-form"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/auth/session-store"
import { useAuthHydration } from "@/auth/use-auth-hydration"
import { homePathForRole } from "@/auth/model"

type LocationState = { from?: Location }

export function LoginPage() {
  const hydrated = useAuthHydration()
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  const from = (location.state as LocationState | null)?.from?.pathname

  useEffect(() => {
    document.title = "Ingresar · Distribuidora NOA"
  }, [])

  if (hydrated && user) {
    return <Navigate to={from ?? homePathForRole(user.role)} replace />
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm font-medium tracking-tight text-foreground">
          <IconBuildingWarehouse className="size-5 text-primary" aria-hidden />
          Distribuidora NOA
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acceso mayorista</CardTitle>
            <CardDescription>
              Iniciá sesión con tu cuenta habilitada para operar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <Separator className="my-6" />

        <p className="text-center text-xs text-muted-foreground">
          ¿Problemas para ingresar?{" "}
          <Link
            to="#"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Contactá a tu vendedor
          </Link>
        </p>
      </div>
    </div>
  )
}
