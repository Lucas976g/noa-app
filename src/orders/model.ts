import type { CartItem } from "@/catalog/model"

export type OrderStatusId =
  | "en-analisis"
  | "en-proceso"
  | "entregado"
  | "cancelado"

export type PaymentMethod = "cuenta-corriente" | "contado"

export type Order = {
  id: string
  createdAt: string
  updatedAt?: string
  userId: string
  userName: string
  items: CartItem[]
  subtotal: number
  paymentMethod: PaymentMethod
  status: OrderStatusId
  cancelReason?: string
  deliveryAddress?: string
}

export type CreateOrderInput = {
  userId: string
  userName: string
  items: CartItem[]
  subtotal: number
  paymentMethod: PaymentMethod
  deliveryAddress?: string
}

export type UpdateOrderInput = Partial<
  Pick<Order, "status" | "cancelReason">
>

// Order status config
export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"

export type OrderStatus = {
  id: OrderStatusId
  label: string
  tone: BadgeVariant
}

export const ORDER_STATUSES: ReadonlyArray<OrderStatus> = [
  { id: "en-analisis", label: "En análisis", tone: "secondary" },
  { id: "en-proceso", label: "En proceso", tone: "default" },
  { id: "entregado", label: "Entregado/Recibido", tone: "outline" },
  { id: "cancelado", label: "Cancelado", tone: "destructive" },
]

export const normalizeOrderStatus = (
  raw: string | undefined | null
): OrderStatusId => {
  if (!raw) return "en-analisis"
  const s = raw.toLowerCase().trim()
  if (
    s.includes("cancel") ||
    s.includes("rechaz") ||
    s.includes("anul")
  ) {
    return "cancelado"
  }
  if (
    s === "entregado" ||
    s === "completado" ||
    s === "recibido" ||
    s === "finalizado" ||
    s.includes("entreg") ||
    s.includes("complet")
  ) {
    return "entregado"
  }
  if (
    s === "proceso" ||
    s === "en-proceso" ||
    s === "en_proceso" ||
    s === "en proceso" ||
    s.includes("proces")
  ) {
    return "en-proceso"
  }
  if (
    s === "analisis" ||
    s === "en-analisis" ||
    s === "en_analisis" ||
    s === "en analisis" ||
    s.includes("analis") ||
    s.includes("pendient")
  ) {
    return "en-analisis"
  }
  return "en-analisis"
}

export const normalizePaymentMethod = (
  raw: string | undefined | null
): PaymentMethod => {
  if (!raw) return "contado"
  const s = raw.toLowerCase().trim()
  if (
    s.includes("cuenta") ||
    s.includes("corriente") ||
    s === "cc" ||
    s === "cta-cte" ||
    s === "cta_cte"
  ) {
    return "cuenta-corriente"
  }
  return "contado"
}

export const getOrderStatus = (id: string): OrderStatus => {
  const normalizedId = normalizeOrderStatus(id)
  const found = ORDER_STATUSES.find((s) => s.id === normalizedId)
  if (!found) {
    return {
      id: "en-proceso",
      label: id || "En proceso",
      tone: "default",
    }
  }
  return found
}

// Payment methods config
export type PaymentMethodConfig = {
  id: PaymentMethod
  label: string
  description: string
}

export const PAYMENT_METHODS: ReadonlyArray<PaymentMethodConfig> = [
  {
    id: "cuenta-corriente",
    label: "Cuenta corriente",
    description: "Se debita de tu cuenta y se liquida a fin de mes.",
  },
  {
    id: "contado",
    label: "Contado",
    description: "Pago inmediato al confirmar el pedido.",
  },
]
