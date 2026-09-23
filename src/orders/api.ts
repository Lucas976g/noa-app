import type { CartItem } from "@/catalog/model"
import { apiFetch } from "@/shared/http/client"
import type {
  CreateOrderInput,
  Order,
  OrderStatusId,
  OrderValidation,
  PaymentMethod,
} from "./model"

type ApiOrderStatus = "analisis" | "proceso" | "entregado" | "cancelado"
type ApiPaymentMethod = "contado" | "cuenta_corriente"

type ApiOrderItem = {
  productId: string
  name: string
  unit: string
  unitPrice: number
  quantity: number
}

type ApiOrder = {
  id: string
  clientId: string
  clientName: string
  deliveryAddress: string
  status: ApiOrderStatus
  totalAmount: number
  paymentMethod: ApiPaymentMethod
  observations: string | null
  createdAt: string
  updatedAt: string
  deliveredAt: string | null
  canceledAt: string | null
  cancelReason: string | null
  cancelObservations: string | null
  deliveryObservations: string | null
  // Solo presente en GET /orders/:id y en la respuesta de POST /orders: los
  // listados (GET /orders, GET /orders/my-orders) no hacen join a items.
  items?: ApiOrderItem[]
}

type ApiOrderValidation = {
  valid: boolean
  reason?: string
  message?: string
  totalAmount: number
  paymentMethod: ApiPaymentMethod
  availableBalance?: number
  remainingBalance?: number
}

const STATUS_FROM_API: Readonly<Record<ApiOrderStatus, OrderStatusId>> = {
  analisis: "en-analisis",
  proceso: "en-proceso",
  entregado: "entregado",
  cancelado: "cancelado",
}

const STATUS_TO_API: Readonly<Record<OrderStatusId, ApiOrderStatus>> = {
  "en-analisis": "analisis",
  "en-proceso": "proceso",
  entregado: "entregado",
  cancelado: "cancelado",
}

const PAYMENT_FROM_API: Readonly<Record<ApiPaymentMethod, PaymentMethod>> = {
  contado: "contado",
  cuenta_corriente: "cuenta-corriente",
}

const PAYMENT_TO_API: Readonly<Record<PaymentMethod, ApiPaymentMethod>> = {
  contado: "contado",
  "cuenta-corriente": "cuenta_corriente",
}

const mapItem = (item: ApiOrderItem): CartItem => ({
  productId: item.productId,
  name: item.name,
  unit: item.unit,
  price: Number(item.unitPrice),
  quantity: item.quantity,
})

// Devuelve null si el backend manda un estado, método de pago o fecha que el
// frontend no puede interpretar: renderizarlo rompería la pantalla.
const mapOrder = (o: ApiOrder): Order | null => {
  const status = STATUS_FROM_API[o.status]
  const paymentMethod = PAYMENT_FROM_API[o.paymentMethod]
  if (!status || !paymentMethod || Number.isNaN(Date.parse(o.createdAt))) {
    console.warn(
      `Pedido ${o.id} descartado: estado "${o.status}", método de pago "${o.paymentMethod}" o fecha "${o.createdAt}" inválidos`
    )
    return null
  }
  return {
    id: o.id,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt || undefined,
    userId: o.clientId,
    userName: o.clientName,
    items: o.items ? o.items.map(mapItem) : [],
    subtotal: Number(o.totalAmount),
    paymentMethod,
    status,
    observations: o.observations ?? undefined,
    deliveryAddress: o.deliveryAddress || undefined,
    deliveredAt: o.deliveredAt ?? undefined,
    deliveryObservations: o.deliveryObservations ?? undefined,
    canceledAt: o.canceledAt ?? undefined,
    cancelReason: o.cancelReason ?? undefined,
    cancelObservations: o.cancelObservations ?? undefined,
  }
}

const mapOrders = (orders: ApiOrder[]): Order[] =>
  orders.flatMap((o) => mapOrder(o) ?? [])

const mapOrderOrThrow = (o: ApiOrder): Order => {
  const order = mapOrder(o)
  if (!order) throw new Error("Respuesta inesperada del servidor.")
  return order
}

// GET /orders — todas las órdenes (roles: administracion, director). No trae
// items: solo lo hacen GET /orders/:id y la respuesta de POST /orders.
export const fetchOrders = async (status?: OrderStatusId): Promise<Order[]> => {
  const query = status ? `?status=${STATUS_TO_API[status]}` : ""
  return mapOrders(await apiFetch<ApiOrder[]>(`/orders${query}`))
}

// GET /orders/my-orders — órdenes del cliente autenticado (rol: cliente)
export const fetchMyOrders = async (): Promise<Order[]> => {
  return mapOrders(await apiFetch<ApiOrder[]>("/orders/my-orders"))
}

// GET /orders/:id — detalle completo, con items. Permitido para el cliente
// dueño del pedido (403 si es de otro cliente).
export const fetchOrder = async (id: string): Promise<Order> => {
  return mapOrderOrThrow(await apiFetch<ApiOrder>(`/orders/${id}`))
}

// POST /orders/validate — prevalida productos y saldo sin persistir nada
// (rol: cliente).
export const validateOrder = async (input: {
  paymentMethod: PaymentMethod
  items: ReadonlyArray<Pick<CartItem, "productId" | "quantity">>
}): Promise<OrderValidation> => {
  const data = await apiFetch<ApiOrderValidation>("/orders/validate", {
    method: "POST",
    body: JSON.stringify({
      paymentMethod: PAYMENT_TO_API[input.paymentMethod],
      items: input.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    }),
  })
  const paymentMethod =
    PAYMENT_FROM_API[data.paymentMethod] ?? input.paymentMethod
  const totalAmount = Number(data.totalAmount)
  if (data.valid) {
    return {
      valid: true,
      totalAmount,
      paymentMethod,
      availableBalance: data.availableBalance,
      remainingBalance: data.remainingBalance,
    }
  }
  return {
    valid: false,
    reason: data.reason ?? "UNKNOWN",
    message: data.message ?? "El pedido no es válido.",
    totalAmount,
    paymentMethod,
    availableBalance: data.availableBalance,
  }
}

// POST /orders — crear y confirmar un nuevo pedido (rol: cliente). El
// clientId sale de la sesión: no se envía. La respuesta trae el pedido
// completo con clientName, deliveryAddress e items ya calculados.
export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const created = await apiFetch<ApiOrder>("/orders", {
    method: "POST",
    body: JSON.stringify({
      paymentMethod: PAYMENT_TO_API[input.paymentMethod],
      observations: input.observations,
      items: input.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    }),
  })
  return mapOrderOrThrow(created)
}

// PUT /orders/:id/process — pasar a "en proceso" (roles: deposito, director)
export const processOrder = async (id: string): Promise<Order> => {
  const order = await apiFetch<ApiOrder>(`/orders/${id}/process`, {
    method: "PUT",
  })
  return mapOrderOrThrow(order)
}

// PUT /orders/:id/cancel — cancelar (roles: cliente, deposito, director).
// El cliente solo si el pedido es suyo y está "en análisis"; depósito y
// director también en "en proceso". Si era cuenta corriente, revierte saldo.
export const cancelOrder = async (
  id: string,
  input?: { reason?: string; observations?: string }
): Promise<Order> => {
  const order = await apiFetch<ApiOrder>(`/orders/${id}/cancel`, {
    method: "PUT",
    body: JSON.stringify({
      reason: input?.reason,
      observations: input?.observations,
    }),
  })
  return mapOrderOrThrow(order)
}

// PUT /orders/:id/deliver — marcar entregado y asentar el cobro o la
// imputación a cuenta corriente en el mismo paso (roles: logistica, director).
// Pedido contado: enviar paymentMethod (recibido debe coincidir con el
// total, así que no hace falta mandarlo). Cuenta corriente: no enviar
// paymentMethod (el backend responde 400 si se manda).
export const deliverOrder = async (
  id: string,
  input: { paymentMethod?: "efectivo" | "transferencia"; observations?: string }
): Promise<Order> => {
  const order = await apiFetch<ApiOrder>(`/orders/${id}/deliver`, {
    method: "PUT",
    body: JSON.stringify({
      paymentMethod: input.paymentMethod,
      observations: input.observations,
    }),
  })
  return mapOrderOrThrow(order)
}
