import type { Delivery } from "./model"

// GET /deliveries — listar todas las entregas
export const fetchDeliveries = async (): Promise<Delivery[]> => {
  // TODO: implementar
  // return apiFetch<Delivery[]>("/deliveries")
  throw new Error("Not implemented: GET /deliveries")
}

// POST /deliveries — registrar una entrega
export const registerDelivery = async (): Promise<Delivery> => {
  // TODO: implementar
  // return apiFetch<Delivery>("/deliveries", { method: "POST", body: JSON.stringify(input) })
  throw new Error("Not implemented: POST /deliveries")
}

// POST /deliveries/:orderId/cancel — cancelar una entrega
export const cancelDelivery = async (): Promise<void> => {
  // TODO: implementar
  // await apiFetch(`/deliveries/${orderId}/cancel`, { method: "POST", body: JSON.stringify({ reason, observations }) })
  throw new Error("Not implemented: POST /deliveries/:orderId/cancel")
}
