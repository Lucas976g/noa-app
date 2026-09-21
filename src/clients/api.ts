import { apiFetch } from "@/shared/http/client"
import type { Account, AccountBlockReason, AccountCheckResult } from "./model"

type ApiClientProfile = {
  direccionEntrega: string
  cuentaCorriente: {
    limiteCredito: number
    saldoDisponible: number
    saldoDeudor: number
  } | null
}

// GET /clients/profile — cuenta corriente del cliente autenticado
// (null si el cliente no tiene cuenta corriente habilitada)
export const fetchMyAccount = async (): Promise<Account | null> => {
  const profile = await apiFetch<ApiClientProfile>("/clients/profile")
  const cc = profile.cuentaCorriente
  if (!cc) return null
  return {
    creditLimit: cc.limiteCredito,
    currentDebt: cc.saldoDeudor,
    availableBalance: cc.saldoDisponible,
    defaultAddress: profile.direccionEntrega,
  }
}

// El backend no expone un endpoint de validación: la valida al crear el pedido
// (POST /orders responde 400 "RECHAZADO: ..."). Para avisar antes de confirmar
// se evalúa contra la cuenta corriente de GET /clients/profile.
export const checkAccount = async (
  subtotal: number
): Promise<{ result: AccountCheckResult; account: Account }> => {
  const account = await fetchMyAccount()
  if (!account) {
    throw new Error("No tenés cuenta corriente habilitada.")
  }
  if (subtotal <= account.availableBalance) {
    return { result: { ok: true }, account }
  }
  const reason: AccountBlockReason =
    subtotal > account.creditLimit ? "excede-limite" : "saldo-insuficiente"
  return {
    result: {
      ok: false,
      reason,
      shortfall: subtotal - account.availableBalance,
    },
    account,
  }
}

// GET /clients — listar todos los clientes
export const fetchClients = async (): Promise<Account[]> => {
  // TODO: implementar
  // return apiFetch<Account[]>("/clients")
  throw new Error("Not implemented: GET /clients")
}

// PATCH /clients/:id — actualizar cliente (límite de crédito, bloqueo, etc.)
export const updateClient = async (): Promise<Account> => {
  // TODO: implementar
  // return apiFetch<Account>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(data) })
  throw new Error("Not implemented: PATCH /clients/:id")
}

// POST /clients/:id/block — bloquear cliente
export const blockClient = async (): Promise<void> => {
  // TODO: implementar
  // await apiFetch(`/clients/${id}/block`, { method: "POST", body: JSON.stringify({ reason }) })
  throw new Error("Not implemented: POST /clients/:id/block")
}

// POST /clients/:id/unblock — desbloquear cliente
export const unblockClient = async (): Promise<void> => {
  // TODO: implementar
  // await apiFetch(`/clients/${id}/unblock`, { method: "POST" })
  throw new Error("Not implemented: POST /clients/:id/unblock")
}
