export const CASH_BASE_BALANCE = 50_000

export const CIERRE_HORA_DESDE = 20
export const CIERRE_HORA_HASTA = 24

export const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires"

export type CashClosingMethod =
  | "efectivo"
  | "transferencia"
  | "imputacion-cta-cte"

export type CashClosingMethodSummary = {
  count: number
  amount: number
}

export const REJECTION_SAMPLES_LIMIT = 5

export type ClosingOperation = {
  id: string
  time: string
  clientName: string
  description: string
  methodLabel: string
  amount: number
  status: "entregado" | "rechazado"
  statusLabel: string
}

export type CashClosing = {
  id: string
  date: string
  generatedAt: string
  baseBalance: number
  totalCollected: number
  paymentMethods: Record<CashClosingMethod, CashClosingMethodSummary>
  deliveredCount: number
  rejectedCount: number
  rejectionSamples: string[]
  balanceAfter: number
  deliveryCount: number
  orderCount: number
  operations: ClosingOperation[]
}

export type ClosingComputation = {
  baseBalance: number
  totalCollected: number
  paymentMethods: Record<CashClosingMethod, CashClosingMethodSummary>
  deliveredCount: number
  rejectedCount: number
  rejectionSamples: string[]
  balanceAfter: number
  deliveryCount: number
  orderCount: number
  operations: ClosingOperation[]
}
