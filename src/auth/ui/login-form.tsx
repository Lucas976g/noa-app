import { useState } from "react"
import { useNavigate, useLocation, type Location } from "react-router"
import { IconLogin } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

import { useAuthStore } from "@/auth/session-store"
import { homePathForRole } from "@/auth/model"

type LocationState = { from?: Location }

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return

    setError(null)
    setSubmitting(true)

    const result = await login(email, password)
    setSubmitting(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    const from = (location.state as LocationState | null)?.from?.pathname
    navigate(from ?? homePathForRole(result.role), { replace: true })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <FieldGroup>
        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="usuario@noa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            required
          />
        </Field>

        <Field data-invalid={error ? true : undefined}>
          <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            required
          />
        </Field>

        {error ? <FieldError>{error}</FieldError> : null}
      </FieldGroup>

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Spinner data-icon="inline-start" />
            Ingresando…
          </>
        ) : (
          <>
            <IconLogin data-icon="inline-start" />
            Ingresar
          </>
        )}
      </Button>
    </form>
  )
}
