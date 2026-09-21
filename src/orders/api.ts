import type { DeliveryPaymentMethod } from "@/logistics/model"
import { apiFetch } from "@/shared/http/client"
import type {
  CreateOrderInput,
  Order,
  OrderStatusId,
  PaymentMethod,
} from "./model"

type ApiOrderStatus = "analisis" | "proceso" | "entregado" | "cancelado"
type ApiPaymentMethod = "contado" | "cuenta_corriente"

// El backend no devuelve items, nombre de cliente ni dirección de entrega.
type ApiOrder = {
  id: string
  clientId: string
  status: ApiOrderStatus
  totalAmount: number
  observations: string | null
  paymentMethod: ApiPaymentMethod
  createdAt: string
}

type CreateOrderPayload = Pick<CreateOrderInput, "items" | "paymentMethod"> & {
  observations?: string
}

const STATUS_FROM_API: Readonly<Record<ApiOrderStatus, OrderStatusId>> = {
  analisis: "en-analisis",
  proceso: "en-proceso",
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

// Devuelve null si el backend manda un estado, método de pago o fecha que el
// frontend no puede interpretar: renderizarlo rompería la pantalla.
const mapOrder = (o: ApiOrder, items: Order["items"] = []): Order | null => {
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
    userId: o.clientId,
    userName: "",
    items,
    subtotal: Number(o.totalAmount),
    paymentMethod,
    status,
    observations: o.observations ?? undefined,
  }
}

const mapOrders = (orders: ApiOrder[]): Order[] =>
  orders.flatMap((o) => mapOrder(o) ?? [])

const mapOrderOrThrow = (o: ApiOrder, items?: Order["items"]): Order => {
  const order = mapOrder(o, items)
  if (!order) throw new Error("Respuesta inesperada del servidor.")
  return order
}

// GET /orders — todas las órdenes (roles: administracion, director)
export const fetchOrders = async (): Promise<Order[]> => {
  return mapOrders(await apiFetch<ApiOrder[]>("/orders"))
}

// GET /orders/my-orders — órdenes del cliente autenticado (rol: cliente)
export const fetchMyOrders = async (): Promise<Order[]> => {
  return mapOrders(await apiFetch<ApiOrder[]>("/orders/my-orders"))
}

// POST /orders — crear nueva orden (rol: cliente)
// Si el backend rechaza el pedido (saldo insuficiente) lanza ApiError con
// un mensaje "RECHAZADO: ...".
export const createOrder = async (
  input: CreateOrderPayload
): Promise<Order> => {
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
  return mapOrderOrThrow(created, input.items)
}

// PUT /orders/:id/process — pasar a "en proceso" (roles: deposito, director)
export const processOrder = async (id: string): Promise<Order> => {
  const order = await apiFetch<ApiOrder>(`/orders/${id}/process`, {
    method: "PUT",
  })
  return mapOrderOrThrow(order)
}

// PUT /orders/:id/cancel — cancelar (roles: cliente, deposito, director)
// Si era cuenta corriente, el backend revierte el saldo.
export const cancelOrder = async (id: string): Promise<Order> => {
  const order = await apiFetch<ApiOrder>(`/orders/${id}/cancel`, {
    method: "PUT",
  })
  return mapOrderOrThrow(order)
}

// PUT /orders/:id/deliver — marcar entregado (roles: logistica, director)
// Pedido contado: enviar efectivo | transferencia.
// Pedido cuenta corriente: enviar {} (imputación a cuenta corriente).
export const deliverOrder = async (
  id: string,
  paymentMethod: DeliveryPaymentMethod
): Promise<Order> => {
  const body = paymentMethod === "imputacion-cta-cte" ? {} : { paymentMethod }
  const order = await apiFetch<ApiOrder>(`/orders/${id}/deliver`, {
    method: "PUT",
    body: JSON.stringify(body),
  })
  return mapOrderOrThrow(order)
}
