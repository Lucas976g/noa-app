export type DeliveryPaymentMethod =
  | "efectivo"
  | "transferencia"
  | "imputacion-cta-cte"

export type DeliveryPaymentMethodConfig = {
  id: DeliveryPaymentMethod
  label: string
  description: string
}

export const DELIVERY_PAYMENT_METHODS: ReadonlyArray<DeliveryPaymentMethodConfig> =
  [
    {
      id: "efectivo",
      label: "Efectivo",
      description: "Cobro en efectivo contra entrega.",
    },
    {
      id: "transferencia",
      label: "Transferencia",
      description: "El cliente transfiere el pago en el momento.",
    },
    {
      id: "imputacion-cta-cte",
      label: "Imputación a cuenta corriente",
      description:
        "Se debita de la cuenta del cliente. Podés imputar todo o solo una parte.",
    },
  ]

export const getDeliveryPaymentMethod = (
  id: DeliveryPaymentMethod
): DeliveryPaymentMethodConfig => {
  const found = DELIVERY_PAYMENT_METHODS.find((m) => m.id === id)
  if (!found) {
    throw new Error(`Unknown delivery payment method: ${id}`)
  }
  return found
}

export type DeliveryCancelReason =
  | "cliente-ausente"
  | "direccion-incorrecta"
  | "producto-danado"
  | "rechazado"
  | "duplicado"
  | "otro"

export type DeliveryCancelReasonConfig = {
  id: DeliveryCancelReason
  label: string
  description: string
}

export const DELIVERY_CANCEL_REASONS: ReadonlyArray<DeliveryCancelReasonConfig> =
  [
    {
      id: "cliente-ausente",
      label: "Cliente ausente",
      description: "Nadie recibió el pedido en la dirección.",
    },
    {
      id: "direccion-incorrecta",
      label: "Dirección incorrecta",
      description: "La dirección no existe o no se pudo encontrar.",
    },
    {
      id: "producto-danado",
      label: "Producto en mal estado",
      description: "La mercadería llegó dañada al momento de la entrega.",
    },
    {
      id: "rechazado",
      label: "Cliente rechazó el pedido",
      description: "El cliente no quiso recibir la mercadería.",
    },
    {
      id: "duplicado",
      label: "Pedido duplicado",
      description: "Se detectó un duplicado del mismo pedido.",
    },
    {
      id: "otro",
      label: "Otro motivo",
      description: "Especificá el motivo en las observaciones.",
    },
  ]

export const getDeliveryCancelReason = (
  id: DeliveryCancelReason
): DeliveryCancelReasonConfig => {
  const found = DELIVERY_CANCEL_REASONS.find((r) => r.id === id)
  if (!found) {
    throw new Error(`Unknown delivery cancel reason: ${id}`)
  }
  return found
}

export type Delivery = {
  id: string
  orderId: string
  userId: string
  paymentMethod: DeliveryPaymentMethod
  amount: number
  receivedAmount: number
  debtAmount: number
  observations?: string
  deliveredAt: string
  cancellationReason?: DeliveryCancelReason
  cancellationObservations?: string
}

export type CreateDeliveryInput = {
  orderId: string
  userId: string
  paymentMethod: DeliveryPaymentMethod
  receivedAmount: number
  debtAmount: number
  observations?: string
}
