import type { Order } from "./model"

// GET /orders — listar todas las órdenes (o filtradas por usuario)
export const fetchOrders = async (): Promise<Order[]> => {
  // TODO: implementar
  // return apiFetch<Order[]>("/orders")
  throw new Error("Not implemented: GET /orders")
}

// POST /orders — crear nueva orden
export const createOrder = async (): Promise<Order> => {
  // TODO: implementar
  // return apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(input) })
  throw new Error("Not implemented: POST /orders")
}

// PATCH /orders/:id — actualizar estado de una orden
export const updateOrder = async (): Promise<Order> => {
  // TODO: implementar
  // return apiFetch<Order>(`/orders/${id}`, { method: "PATCH", body: JSON.stringify(input) })
  throw new Error("Not implemented: PATCH /orders/:id")
}
