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

export const getOrderStatus = (id: OrderStatusId): OrderStatus => {
  const found = ORDER_STATUSES.find((s) => s.id === id)
  if (!found) {
    throw new Error(`Unknown order status: ${id}`)
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
