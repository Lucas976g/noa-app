import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

import { useAuthStore } from "@/auth/session-store"
import {
  cancelDelivery as cancelDeliveryRequest,
  fetchDeliveries,
  registerDelivery as registerDeliveryRequest,
} from "./api"
import {
  DELIVERY_PAYMENT_METHODS,
  type CreateDeliveryInput,
  type Delivery,
  type DeliveryCancelReason,
} from "./model"

type DeliveriesState = {
  deliveries: Delivery[]
  isLoading: boolean
  loadError: string | null
  loadDeliveries: () => Promise<void>
  createDelivery: (input: CreateDeliveryInput) => Promise<Delivery>
  createDeliveryCancellation: (input: {
    orderId: string
    userId: string
    reason: DeliveryCancelReason
    observations?: string
  }) => Promise<Delivery>
}

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "No pudimos cargar las entregas."

const isCancellation = (delivery: Delivery): boolean =>
  delivery.cancellationReason !== undefined

// El backend no devuelve el cliente, las observaciones ni el reparto entre
// cobrado y deuda: se conservan los datos locales de la entrega ya conocida.
const mergeWithCached = (fetched: Delivery, cached?: Delivery): Delivery => {
  if (!cached || isCancellation(cached)) return fetched
  return {
    ...fetched,
    userId: fetched.userId || cached.userId,
    observations: fetched.observations ?? cached.observations,
    receivedAmount: cached.receivedAmount,
    debtAmount: cached.debtAmount,
  }
}

// Entregas creadas mientras una carga estaba en vuelo: la respuesta de esa
// carga es anterior al cambio y no debe pisarlo. Se indexan por pedido.
let loadSeq = 0
const changedDuringLoad = new Set<string>()

const isKnownDelivery = (delivery: Delivery): boolean =>
  DELIVERY_PAYMENT_METHODS.some((m) => m.id === delivery.paymentMethod) &&
  !Number.isNaN(Date.parse(delivery.deliveredAt))

// Una entrega por pedido: la nueva reemplaza a la anterior del mismo pedido.
const withDelivery = (
  deliveries: Delivery[],
  delivery: Delivery
): Delivery[] => [
  delivery,
  ...deliveries.filter((d) => d.orderId !== delivery.orderId),
]

export const useDeliveriesStore = create<DeliveriesState>()(
  persist(
    (set, get) => ({
      deliveries: [],
      isLoading: false,
      loadError: null,
      loadDeliveries: async () => {
        // GET /collections es solo para administración y director.
        const role = useAuthStore.getState().user?.role
        if (!role || role === "cliente") return

        const seq = ++loadSeq
        changedDuringLoad.clear()
        set({ isLoading: true, loadError: null })
        try {
          const fetched = await fetchDeliveries()
          // Una carga más nueva la reemplazó: su resultado es el vigente.
          if (seq !== loadSeq) return

          const local = new Map(get().deliveries.map((d) => [d.orderId, d]))
          const fetchedOrders = new Set(fetched.map((d) => d.orderId))
          const merged = fetched.map((d) => {
            const current = local.get(d.orderId)
            return current && changedDuringLoad.has(d.orderId)
              ? current
              : mergeWithCached(d, current)
          })
          // El backend no lista las cancelaciones: se conservan las locales.
          const kept = get().deliveries.filter(
            (d) =>
              !fetchedOrders.has(d.orderId) &&
              (isCancellation(d) || changedDuringLoad.has(d.orderId))
          )
          set({ deliveries: [...kept, ...merged], isLoading: false })
        } catch (error) {
          if (seq !== loadSeq) return
          // Se conservan las entregas cacheadas en localStorage.
          set({ isLoading: false, loadError: errorMessage(error) })
        }
      },
      createDelivery: async (input) => {
        const delivery = await registerDeliveryRequest(input)
        changedDuringLoad.add(delivery.orderId)
        set((state) => ({
          deliveries: withDelivery(state.deliveries, delivery),
        }))
        return delivery
      },
      createDeliveryCancellation: async (input) => {
        await cancelDeliveryRequest(input)
        const delivery: Delivery = {
          id: input.orderId,
          orderId: input.orderId,
          userId: input.userId,
          paymentMethod: "efectivo",
          amount: 0,
          receivedAmount: 0,
          debtAmount: 0,
          deliveredAt: new Date().toISOString(),
          cancellationReason: input.reason,
          cancellationObservations: input.observations,
        }
        changedDuringLoad.add(delivery.orderId)
        set((state) => ({
          deliveries: withDelivery(state.deliveries, delivery),
        }))
        return delivery
      },
    }),
    {
      name: "noa-deliveries",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ deliveries: state.deliveries }),
      // Descarta entregas cacheadas con valores que la app ya no entiende.
      merge: (persisted, current) => {
        const stored = (persisted as { deliveries?: Delivery[] } | undefined)
          ?.deliveries
        return {
          ...current,
          deliveries: Array.isArray(stored)
            ? stored.filter(isKnownDelivery)
            : [],
        }
      },
    }
  )
)

export const selectDeliveryByOrder = (
  deliveries: Delivery[],
  orderId: string
): Delivery | undefined => deliveries.find((d) => d.orderId === orderId)
