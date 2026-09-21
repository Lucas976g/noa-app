import { useEffect, useMemo, useState } from "react"
import { IconInbox, IconTruckDelivery } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { clientLabel } from "@/logistics/client-label"
import {
  getDeliveryCancelReason,
  type CreateDeliveryInput,
  type DeliveryCancelReason,
} from "@/logistics/model"
import { useDeliveriesStore } from "@/logistics/store"
import { DeliveryOrderCard } from "@/logistics/ui/delivery-order-card"
import type { Order } from "@/orders/model"
import { selectOrdersForStatus, useOrdersStore } from "@/orders/store"
import { CancelDeliveryDialog } from "@/orders/ui/cancel-delivery-dialog"
import { RegisterDeliveryDialog } from "@/orders/ui/register-delivery-dialog"

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

export function AdminLogisticaPage() {
  useEffect(() => {
    document.title = "Logística · Distribuidora NOA"
  }, [])

  const orders = useOrdersStore((s) => s.orders)
  const isLoading = useOrdersStore((s) => s.isLoading)
  const loadError = useOrdersStore((s) => s.loadError)
  const loadOrders = useOrdersStore((s) => s.loadOrders)
  const applyOrderStatus = useOrdersStore((s) => s.applyOrderStatus)
  const loadDeliveries = useDeliveriesStore((s) => s.loadDeliveries)
  const createDelivery = useDeliveriesStore((s) => s.createDelivery)
  const createDeliveryCancellation = useDeliveriesStore(
    (s) => s.createDeliveryCancellation
  )

  useEffect(() => {
    void loadOrders()
    void loadDeliveries()
  }, [loadOrders, loadDeliveries])

  const inProgress = useMemo(
    () => selectOrdersForStatus(orders, "en-proceso"),
    [orders]
  )

  const [registerId, setRegisterId] = useState<string | null>(null)
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogError, setDialogError] = useState<string | null>(null)
  const registerTarget = inProgress.find((o) => o.id === registerId)
  const cancelTarget = inProgress.find((o) => o.id === cancelId)

  const openRegister = (order: Order) => {
    setDialogError(null)
    setRegisterId(order.id)
  }

  const openCancel = (order: Order) => {
    setDialogError(null)
    setCancelId(order.id)
  }

  const closeDialogs = () => {
    setRegisterId(null)
    setCancelId(null)
    setDialogError(null)
  }

  // Si la API falla, el dialog sigue abierto con el error y no se toca el state.
  const confirmRegister = async (
    input: Omit<CreateDeliveryInput, "orderId" | "userId">
  ) => {
    if (!registerTarget || isSubmitting) return
    setIsSubmitting(true)
    setDialogError(null)
    try {
      await createDelivery({
        orderId: registerTarget.id,
        userId: registerTarget.userId,
        ...input,
      })
      applyOrderStatus(registerTarget.id, "entregado")
      toast.success("Entrega registrada")
      closeDialogs()
    } catch (error) {
      setDialogError(errorMessage(error, "No pudimos registrar la entrega."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmCancel = async (input: {
    reason: DeliveryCancelReason
    observations: string
  }) => {
    if (!cancelTarget || isSubmitting) return
    setIsSubmitting(true)
    setDialogError(null)
    try {
      await createDeliveryCancellation({
        orderId: cancelTarget.id,
        userId: cancelTarget.userId,
        reason: input.reason,
        observations: input.observations || undefined,
      })
      const label = getDeliveryCancelReason(input.reason).label
      applyOrderStatus(
        cancelTarget.id,
        "cancelado",
        input.observations ? `${label}: ${input.observations}` : label
      )
      toast.success("Pedido cancelado")
      closeDialogs()
    } catch (error) {
      setDialogError(errorMessage(error, "No pudimos cancelar el pedido."))
    } finally {
      setIsSubmitting(false)
    }
  }

  const showInitialLoading = isLoading && orders.length === 0
  const showLoadError = Boolean(loadError) && orders.length === 0

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconTruckDelivery className="size-4" aria-hidden />
          <span className="text-xs tracking-wider uppercase">Logística</span>
        </div>
        <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
          Entregas pendientes
        </h1>
        <p className="text-sm text-muted-foreground">
          Pedidos en proceso listos para entregar. Registrá la entrega o cancelá
          el pedido.
        </p>
      </header>

      <section
        className="flex flex-col gap-3"
        aria-labelledby="deliveries-list"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 id="deliveries-list" className="text-sm font-medium">
            Pedidos en proceso
          </h2>
          {inProgress.length > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {inProgress.length}
            </span>
          ) : null}
        </div>

        {loadError && orders.length > 0 ? (
          <p
            role="status"
            className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground"
          >
            No pudimos actualizar los pedidos. Mostramos la última información
            guardada.
          </p>
        ) : null}

        {showInitialLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6 text-muted-foreground" />
          </div>
        ) : showLoadError ? (
          <Empty className="max-w-md self-center py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconInbox />
              </EmptyMedia>
              <EmptyTitle>Error al cargar</EmptyTitle>
              <EmptyDescription>{loadError}</EmptyDescription>
            </EmptyHeader>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadOrders()}
            >
              Reintentar
            </Button>
          </Empty>
        ) : inProgress.length === 0 ? (
          <Empty className="max-w-md self-center py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconTruckDelivery />
              </EmptyMedia>
              <EmptyTitle>No hay entregas pendientes</EmptyTitle>
              <EmptyDescription>
                Cuando un pedido pase a “En proceso” lo vas a ver acá.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {inProgress.map((order) => (
              <li key={order.id}>
                <DeliveryOrderCard
                  order={order}
                  onRegisterDelivery={openRegister}
                  onCancel={openCancel}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {registerTarget ? (
        <RegisterDeliveryDialog
          open
          onOpenChange={(open) => {
            if (!open) closeDialogs()
          }}
          shortId={registerTarget.id.slice(0, 8).toUpperCase()}
          clientName={clientLabel(registerTarget)}
          deliveryAddress={registerTarget.deliveryAddress}
          subtotal={registerTarget.subtotal}
          orderPaymentMethod={registerTarget.paymentMethod}
          isSubmitting={isSubmitting}
          error={dialogError}
          onConfirm={(input) => void confirmRegister(input)}
        />
      ) : null}

      {cancelTarget ? (
        <CancelDeliveryDialog
          open
          onOpenChange={(open) => {
            if (!open) closeDialogs()
          }}
          shortId={cancelTarget.id.slice(0, 8).toUpperCase()}
          clientName={clientLabel(cancelTarget)}
          isSubmitting={isSubmitting}
          error={dialogError}
          onConfirm={(input) => void confirmCancel(input)}
        />
      ) : null}
    </div>
  )
}
