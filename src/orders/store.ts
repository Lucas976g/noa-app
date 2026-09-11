import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import type { Order, CreateOrderInput, UpdateOrderInput } from "./model"

type OrdersState = {
  orders: Order[]
  createOrder: (input: CreateOrderInput) => Order
  updateOrder: (id: string, input: UpdateOrderInput) => Order | undefined
}

const generateId = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set) => ({
      orders: [],
      createOrder: (input) => {
        const now = new Date().toISOString()
        const order: Order = {
          id: generateId(),
          createdAt: now,
          updatedAt: now,
          userId: input.userId,
          userName: input.userName,
          items: input.items,
          subtotal: input.subtotal,
          paymentMethod: input.paymentMethod,
          status: "en-analisis",
          deliveryAddress: input.deliveryAddress,
        }
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },
      updateOrder: (id, input) => {
        let updated: Order | undefined
        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== id) return order
            updated = {
              ...order,
              status: input.status ?? order.status,
              cancelReason:
                input.status === "cancelado"
                  ? input.cancelReason
                  : undefined,
              updatedAt: new Date().toISOString(),
            }
            return updated
          }),
        }))
        return updated
      },
    }),
    {
      name: "noa-orders",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ orders: state.orders }),
    }
  )
)

export const selectOrdersForUser = (orders: Order[], userId: string): Order[] =>
  orders
    .filter((order) => order.userId === userId)
    .toSorted(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
