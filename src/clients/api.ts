import type { CartItem } from "@/catalog/model"
import { validateOrder } from "@/orders/api"
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

// POST /orders/validate prevalida el pedido sin persistir nada: confirma que
// los productos sigan disponibles y, en cuenta corriente, si el saldo
// alcanza. Se pide en paralelo el perfil, para tener el límite de crédito y
// poder distinguir "excede límite" de "saldo insuficiente".
export const checkAccount = async (
  items: ReadonlyArray<Pick<CartItem, "productId" | "quantity">>
): Promise<{
  result: AccountCheckResult
  account: Account
  totalAmount: number
}> => {
  const [validation, account] = await Promise.all([
    validateOrder({ paymentMethod: "cuenta-corriente", items }),
    fetchMyAccount(),
  ])
  if (!account) {
    throw new Error("No tenés cuenta corriente habilitada.")
  }
  if (validation.valid) {
    return {
      result: { ok: true },
      account,
      totalAmount: validation.totalAmount,
    }
  }
  const availableBalance =
    validation.availableBalance ?? account.availableBalance
  const reason: AccountBlockReason =
    validation.totalAmount > account.creditLimit
      ? "excede-limite"
      : "saldo-insuficiente"
  return {
    result: {
      ok: false,
      reason,
      shortfall: validation.totalAmount - availableBalance,
    },
    account,
    totalAmount: validation.totalAmount,
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
