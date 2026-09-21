import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { useAuthStore } from "@/auth/session-store"
import {
  cancelOrder as cancelOrderRequest,
  createOrder as createOrderRequest,
  deliverOrder as deliverOrderRequest,
  fetchMyOrders,
  fetchOrders,
  processOrder as processOrderRequest,
} from "./api"
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  type CreateOrderInput,
  type Order,
  type OrderStatusId,
  type UpdateOrderInput,
} from "./model"

type OrdersState = {
  orders: Order[]
  isLoading: boolean
  loadError: string | null
  loadOrders: () => Promise<void>
  createOrder: (input: CreateOrderInput) => Promise<Order>
  updateOrder: (id: string, input: UpdateOrderInput) => Promise<Order>
  // Refleja un cambio que el backend ya confirmó por otra vía (registrar o
  // cancelar una entrega): no hace ninguna petición.
  applyOrderStatus: (
    id: string,
    status: Extract<OrderStatusId, "entregado" | "cancelado">,
    cancelReason?: string
  ) => void
}

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "No pudimos cargar los pedidos."

// El backend no devuelve items, nombre de cliente ni dirección: se conservan
// los datos locales del cache cuando el pedido ya lo teníamos.
const mergeWithCached = (fetched: Order, cached?: Order): Order => {
  if (!cached) return fetched
  return {
    ...fetched,
    items: fetched.items.length > 0 ? fetched.items : cached.items,
    userName: fetched.userName || cached.userName,
    deliveryAddress: fetched.deliveryAddress ?? cached.deliveryAddress,
    cancelReason: fetched.cancelReason ?? cached.cancelReason,
  }
}

// Pedidos creados o modificados mientras una carga estaba en vuelo: la
// respuesta de esa carga es anterior al cambio y no debe pisarlo.
let loadSeq = 0
const changedDuringLoad = new Set<string>()

const isKnownOrder = (order: Order): boolean =>
  ORDER_STATUSES.some((s) => s.id === order.status) &&
  PAYMENT_METHODS.some((m) => m.id === order.paymentMethod) &&
  !Number.isNaN(Date.parse(order.createdAt))

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      isLoading: false,
      loadError: null,
      loadOrders: async () => {
        const role = useAuthStore.getState().user?.role
        if (!role) return

        const seq = ++loadSeq
        changedDuringLoad.clear()
        set({ isLoading: true, loadError: null })
        try {
          const fetched =
            role === "cliente" ? await fetchMyOrders() : await fetchOrders()
          // Una carga más nueva la reemplazó: su resultado es el vigente.
          if (seq !== loadSeq) return

          const local = new Map(get().orders.map((o) => [o.id, o]))
          const fetchedIds = new Set(fetched.map((o) => o.id))
          const merged = fetched.map((o) => {
            const current = local.get(o.id)
            return current && changedDuringLoad.has(o.id)
              ? current
              : mergeWithCached(o, current)
          })
          const created = get().orders.filter(
            (o) => changedDuringLoad.has(o.id) && !fetchedIds.has(o.id)
          )
          set({ orders: [...created, ...merged], isLoading: false })
        } catch (error) {
          if (seq !== loadSeq) return
          // Se conservan los pedidos cacheados en localStorage.
          set({ isLoading: false, loadError: errorMessage(error) })
        }
      },
      createOrder: async (input) => {
        const created = await createOrderRequest(input)
        const order: Order = {
          ...created,
          userName: input.userName,
          deliveryAddress: input.deliveryAddress,
          updatedAt: created.createdAt,
        }
        changedDuringLoad.add(order.id)
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },
      updateOrder: async (id, input) => {
        const current = get().orders.find((o) => o.id === id)
        if (!current) {
          throw new Error("Pedido no encontrado.")
        }

        const status = input.status ?? current.status
        let remote: Order
        if (status === "en-proceso") {
          remote = await processOrderRequest(id)
        } else if (status === "cancelado") {
          remote = await cancelOrderRequest(id)
        } else if (status === "entregado") {
          const method =
            input.deliveryPaymentMethod ??
            (current.paymentMethod === "cuenta-corriente"
              ? "imputacion-cta-cte"
              : undefined)
          if (!method) {
            throw new Error(
              "Indicá el método de cobro para entregar el pedido."
            )
          }
          remote = await deliverOrderRequest(id, method)
        } else {
          throw new Error("El pedido no puede volver a este estado.")
        }

        const updated: Order = {
          ...mergeWithCached(remote, current),
          cancelReason: status === "cancelado" ? input.cancelReason : undefined,
          updatedAt: new Date().toISOString(),
        }
        changedDuringLoad.add(id)
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? updated : o)),
        }))
        return updated
      },
      applyOrderStatus: (id, status, cancelReason) => {
        changedDuringLoad.add(id)
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  cancelReason:
                    status === "cancelado" ? cancelReason : undefined,
                  updatedAt: new Date().toISOString(),
                }
              : o
          ),
        }))
      },
    }),
    {
      name: "noa-orders",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ orders: state.orders }),
      // Descarta pedidos cacheados con valores que la app ya no entiende.
      merge: (persisted, current) => {
        const stored = (persisted as { orders?: Order[] } | undefined)?.orders
        return {
          ...current,
          orders: Array.isArray(stored) ? stored.filter(isKnownOrder) : [],
        }
      },
    }
  )
)

const byNewest = (a: Order, b: Order): number =>
  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()

export const selectOrdersNewestFirst = (orders: Order[]): Order[] =>
  orders.toSorted(byNewest)

export const selectOrdersForUser = (orders: Order[], userId: string): Order[] =>
  orders.filter((order) => order.userId === userId).toSorted(byNewest)

export const selectOrdersForStatus = (
  orders: Order[],
  status: OrderStatusId
): Order[] =>
  orders.filter((order) => order.status === status).toSorted(byNewest)
