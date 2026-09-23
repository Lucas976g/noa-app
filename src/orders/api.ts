import type { Order, UpdateOrderInput } from "./model"
import { normalizeOrderStatus, normalizePaymentMethod } from "./model"
import { mockOrders } from "./mock-data"
import { apiFetch } from "@/shared/http/client"

export const mapApiOrder = (raw: unknown): Order => {
  if (!raw || typeof raw !== "object") {
    throw new Error("Respuesta de orden no válida")
  }

  const record = raw as Record<string, unknown>
  const rawStatus = (record.status ?? record.estado) as string | undefined
  const rawPayment = (record.paymentMethod ??
    record.metodoPago ??
    record.formaPago) as string | undefined
  const rawItems = (record.items ?? record.productos ?? []) as Array<
    Record<string, unknown>
  >

  return {
    id: String(record.id ?? record._id ?? ""),
    createdAt: String(
      record.createdAt ??
        record.fecha ??
        record.created_at ??
        new Date().toISOString()
    ),
    updatedAt: record.updatedAt ? String(record.updatedAt) : undefined,
    userId: String(
      record.clientId ??
        record.userId ??
        record.clienteId ??
        record.usuarioId ??
        ""
    ),
    userName: String(
      record.clientName ??
        record.userName ??
        record.clienteNombre ??
        record.cliente ??
        record.usuario ??
        "Cliente"
    ),
    items: Array.isArray(rawItems)
      ? rawItems.map((item) => ({
          productId: String(item.productId ?? item.id ?? ""),
          name: String(item.name ?? item.nombre ?? "Producto"),
          price: Number(item.unitPrice ?? item.price ?? item.precio ?? 0),
          unit: String(item.unit ?? item.unidad ?? item.unidadMedida ?? "unidad"),
          quantity: Number(item.quantity ?? item.cantidad ?? 1),
        }))
      : [],
    subtotal: Number(
      record.totalAmount ??
        record.subtotal ??
        record.total ??
        record.monto ??
        0
    ),
    paymentMethod: normalizePaymentMethod(rawPayment),
    status:
      record.canceledAt ||
      record.canceled_at ||
      record.cancelledAt ||
      record.cancelled_at
        ? "cancelado"
        : record.deliveredAt || record.delivered_at
          ? "entregado"
          : normalizeOrderStatus(rawStatus),
    cancelReason: record.cancelReason
      ? String(record.cancelReason)
      : record.motivoCancelacion
        ? String(record.motivoCancelacion)
        : undefined,
    deliveryAddress: record.deliveryAddress
      ? String(record.deliveryAddress)
      : record.direccion
        ? String(record.direccion)
        : undefined,
  }
}

// GET /orders – listar órdenes usando el cliente HTTP compartido del proyecto
export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const data = await apiFetch<unknown[]>("/orders")
    if (!Array.isArray(data)) return []
    return data.map(mapApiOrder)
  } catch (error) {
    console.warn("Usando datos locales simulados debido a un error con la API:", error)
    return mockOrders
  }
}

// GET /orders/:id – obtener orden por ID con sus items
export const fetchOrderById = async (id: string): Promise<Order> => {
  try {
    const data = await apiFetch<unknown>(`/orders/${id}`)
    return mapApiOrder(data)
  } catch {
    const data = await apiFetch<unknown>(`/order/${id}`)
    return mapApiOrder(data)
  }
}

// POST /orders – crear nueva orden
export const createOrder = async (input: unknown): Promise<Order> => {
  const data = await apiFetch<unknown>("/orders", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return mapApiOrder(data)
}

export type CancelOrderInput = {
  reason: string
  observations?: string
}

// PUT /orders/:id/cancel – cancelar orden con motivo y observaciones
export const cancelOrder = async (
  id: string,
  input: CancelOrderInput
): Promise<Order> => {
  const payload = {
    reason: input.reason,
    observations: input.observations ?? "",
  }

  try {
    const data = await apiFetch<unknown>(`/orders/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
    return mapApiOrder(data)
  } catch {
    const data = await apiFetch<unknown>(`/order/${id}/cancel`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
    return mapApiOrder(data)
  }
}

// PUT /orders/:id/process – procesar o actualizar estado de una orden
export const updateOrder = async (
  id: string,
  input: UpdateOrderInput
): Promise<Order> => {
  if (input.status === "cancelado") {
    return cancelOrder(id, {
      reason: input.cancelReason || "Cancelado por el director",
      observations: "",
    })
  }

  const backendStatus =
    input.status === "en-proceso" ? "proceso" : input.status
  const payload = {
    ...input,
    status: backendStatus,
    estado: backendStatus,
  }

  try {
    const data = await apiFetch<unknown>(`/orders/${id}/process`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
    return mapApiOrder(data)
  } catch {
    try {
      const data = await apiFetch<unknown>(`/orders/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })
      return mapApiOrder(data)
    } catch {
      const data = await apiFetch<unknown>(`/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      })
      return mapApiOrder(data)
    }
  }
}