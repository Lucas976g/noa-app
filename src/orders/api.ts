import type { Order, UpdateOrderInput } from "./model"
import { mockOrders } from "./mock-data"

// Memoria local temporal para simular la base de datos durante tus pruebas
let ordersMemory = [...mockOrders]

// GET /orders – listar órdenes
export const fetchOrders = async (): Promise<Order[]> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return ordersMemory
}

// POST /orders – crear nueva orden
export const createOrder = async (_input: unknown): Promise<Order> => {
  throw new Error("Not implemented: POST /orders")
}

// PATCH /orders/:id – actualizar estado de una orden
export const updateOrder = async (
  id: string,
  input: UpdateOrderInput
): Promise<Order> => {
  await new Promise((resolve) => setTimeout(resolve, 200))
  
  const index = ordersMemory.findIndex((o) => o.id === id)
  if (index === -1) {
    throw new Error(`Order with id ${id} not found`)
  }

  const updatedOrder: Order = {
    ...ordersMemory[index],
    ...input,
  }
  ordersMemory[index] = updatedOrder

  return updatedOrder
}