import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { useAuthStore } from "@/auth/session-store"
import {
  cancelOrder as cancelOrderRequest,
  createOrder as createOrderRequest,
  deliverOrder as deliverOrderRequest,
  fetchMyOrders,
  fetchOrder,
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
  // Trae el detalle completo (con items) de un pedido y lo mezcla en el
  // state: los listados no traen items, solo GET /orders/:id.
  hydrateOrder: (id: string) => Promise<Order>
}

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "No pudimos cargar los pedidos."

// Los listados (GET /orders, GET /orders/my-orders) no traen items a
// propósito, para no sobrecargar la consulta con joins a productos: se
// conservan los que ya se conocían por una carga de detalle o por la
// creación del pedido.
const mergeWithCached = (fetched: Order, cached?: Order): Order => {
  if (!cached || fetched.items.length > 0) return fetched
  return { ...fetched, items: cached.items }
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
        // La respuesta ya trae clientName, deliveryAddress e items
        // calculados por el backend: no hace falta completarlos a mano.
        const order = await createOrderRequest(input)
        changedDuringLoad.add(order.id)
        set((state) => ({ orders: [order, ...state.orders] }))
        return order
      },
      updateOrder: async (id, input) => {
        const current = get().orders.find((o) => o.id === id)
        if (!current) {
          throw new Error("Pedido no encontrado.")
        }

        let remote: Order
        if (input.status === "en-proceso") {
          remote = await processOrderRequest(id)
        } else if (input.status === "cancelado") {
          remote = await cancelOrderRequest(id, {
            reason: input.reason,
            observations: input.observations,
          })
        } else if (input.status === "entregado") {
          remote = await deliverOrderRequest(id, {
            paymentMethod: input.paymentMethod,
            observations: input.observations,
          })
        } else {
          throw new Error("El pedido no puede volver a este estado.")
        }

        const updated = mergeWithCached(remote, current)
        changedDuringLoad.add(id)
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? updated : o)),
        }))
        return updated
      },
      hydrateOrder: async (id) => {
        const remote = await fetchOrder(id)
        const current = get().orders.find((o) => o.id === id)
        const updated = mergeWithCached(remote, current)
        changedDuringLoad.add(id)
        set((state) => ({
          orders: state.orders.some((o) => o.id === id)
            ? state.orders.map((o) => (o.id === id ? updated : o))
            : [updated, ...state.orders],
        }))
        return updated
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
