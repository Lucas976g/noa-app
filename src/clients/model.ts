export type Account = {
  creditLimit: number
  currentDebt: number
  availableBalance: number
  defaultAddress: string
}

export type AccountBlockReason = "excede-limite" | "saldo-insuficiente"

export type AccountCheckResult =
  | { ok: true }
  | { ok: false; reason: AccountBlockReason; shortfall: number }

export const BLOCK_REASON_TITLES: Readonly<Record<AccountBlockReason, string>> =
  {
    "excede-limite": "Excedés tu límite de crédito",
    "saldo-insuficiente": "Saldo insuficiente",
  }

export const BLOCK_REASON_DESCRIPTIONS: Readonly<
  Record<AccountBlockReason, string>
> = {
  "excede-limite":
    "Tu pedido excede tu límite de crédito. No podemos procesarlo: contactá a tu vendedor para revisar el límite.",
  "saldo-insuficiente":
    "Tu pedido supera tu saldo disponible. Registrás una deuda: pagá las facturas pendientes o reduci el pedido.",
}
