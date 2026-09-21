import { apiFetch } from "@/shared/http/client"
import { cancelOrder, deliverOrder } from "@/orders/api"
import type {
  CreateDeliveryInput,
  Delivery,
  DeliveryCancelReason,
  DeliveryPaymentMethod,
} from "./model"

// El backend no tiene un recurso "entregas": entregar es cambiar el estado del
// pedido (PUT /orders/:id/deliver) y el cobro queda en /collections.
type ApiCollectionMethod = "efectivo" | "transferencia" | "imputacion_cc"

type ApiCollection = {
  id: string
  orderId: string
  amount: number
  paymentMethod: ApiCollectionMethod
  receipt: string | null
  createdAt: string
}

const METHOD_FROM_API: Readonly<
  Record<ApiCollectionMethod, DeliveryPaymentMethod>
> = {
  efectivo: "efectivo",
  transferencia: "transferencia",
  imputacion_cc: "imputacion-cta-cte",
}

// Devuelve null si el backend manda un método de cobro o una fecha que el
// frontend no entiende, para no romper las pantallas que listan entregas.
const mapCollection = (c: ApiCollection): Delivery | null => {
  const paymentMethod = METHOD_FROM_API[c.paymentMethod]
  if (!paymentMethod || Number.isNaN(Date.parse(c.createdAt))) {
    console.warn(
      `Cobro ${c.id} descartado: método "${c.paymentMethod}" o fecha "${c.createdAt}" inválidos`
    )
    return null
  }
  const amount = Number(c.amount)
  const isImputation = paymentMethod === "imputacion-cta-cte"
  return {
    id: c.id,
    orderId: c.orderId,
    // El cobro no trae el cliente.
    userId: "",
    paymentMethod,
    amount,
    receivedAmount: isImputation ? 0 : amount,
    debtAmount: isImputation ? amount : 0,
    deliveredAt: c.createdAt,
  }
}

// GET /collections — cobros registrados por las entregas
// (roles: administracion, director)
export const fetchDeliveries = async (): Promise<Delivery[]> => {
  const collections = await apiFetch<ApiCollection[]>("/collections")
  return collections.flatMap((c) => mapCollection(c) ?? [])
}

// PUT /orders/:orderId/deliver — registrar la entrega (roles: logistica,
// director). El backend cobra el pedido completo: solo toma el método de pago
// (efectivo | transferencia; cuenta corriente se imputa sin body), por lo que
// receivedAmount, debtAmount y observations quedan solo en el Delivery devuelto.
export const registerDelivery = async (
  input: CreateDeliveryInput
): Promise<Delivery> => {
  const order = await deliverOrder(input.orderId, input.paymentMethod)
  return {
    // Una entrega por pedido: se identifica con el id del pedido.
    id: order.id,
    orderId: order.id,
    userId: input.userId,
    paymentMethod: input.paymentMethod,
    amount: order.subtotal,
    receivedAmount: input.receivedAmount,
    debtAmount: input.debtAmount,
    observations: input.observations,
    deliveredAt: new Date().toISOString(),
  }
}

// PUT /orders/:orderId/cancel — cancelar la entrega cancela el pedido
// (roles: cliente, deposito, director; logistica no figura). El endpoint no
// acepta body, así que el motivo y las observaciones no se envían al backend.
export const cancelDelivery = async (input: {
  orderId: string
  reason: DeliveryCancelReason
  observations?: string
}): Promise<void> => {
  await cancelOrder(input.orderId)
}
