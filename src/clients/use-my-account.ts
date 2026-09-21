import { useEffect, useState } from "react"

import { fetchMyAccount } from "@/clients/api"
import type { Account } from "@/clients/model"

type MyAccountState =
  | { status: "loading" }
  | { status: "ready"; account: Account | null }
  | { status: "error"; message: string }

// Cambiar `refreshKey` vuelve a pedir la cuenta sin mostrar el estado de
// carga: se sigue viendo el dato anterior hasta que llega el nuevo.
export function useMyAccount(refreshKey = 0): MyAccountState {
  const [state, setState] = useState<MyAccountState>({ status: "loading" })

  useEffect(() => {
    let cancelled = false
    fetchMyAccount()
      .then((account) => {
        if (!cancelled) setState({ status: "ready", account })
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "No pudimos cargar tu cuenta corriente.",
        })
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return state
}
