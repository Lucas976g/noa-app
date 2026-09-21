import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router"
import { IconInbox, IconReceipt, IconWallet } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { AccountCard } from "@/clients/ui/account-card"
import { useMyAccount } from "@/clients/use-my-account"
import { ClientShell } from "@/layout/client-shell"
import type { Order } from "@/orders/model"
import { selectOrdersNewestFirst, useOrdersStore } from "@/orders/store"
import { CancelOrderDialog } from "@/orders/ui/cancel-order-dialog"
import { ClientOrderDetailDialog } from "@/orders/ui/client-order-detail-dialog"
import { OrderCard } from "@/orders/ui/order-card"

export function OrdersPage() {
  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
  }, [])

  const orders = useOrdersStore((s) => s.orders)
  const isLoading = useOrdersStore((s) => s.isLoading)
  const loadError = useOrdersStore((s) => s.loadError)
  const loadOrders = useOrdersStore((s) => s.loadOrders)
  const updateOrder = useOrdersStore((s) => s.updateOrder)

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const sortedOrders = useMemo(() => selectOrdersNewestFirst(orders), [orders])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedOrder = sortedOrders.find((o) => o.id === selectedId)

  const [cancelId, setCancelId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [accountVersion, setAccountVersion] = useState(0)
  const cancelTarget = sortedOrders.find((o) => o.id === cancelId)

  const requestCancel = (order: Order) => {
    setSelectedId(null)
    setCancelId(order.id)
  }

  const confirmCancel = async () => {
    if (!cancelTarget || isCancelling) return
    setIsCancelling(true)
    try {
      // Depósito pudo haber avanzado el pedido: se confirma el estado actual.
      await loadOrders()
      const current = useOrdersStore
        .getState()
        .orders.find((o) => o.id === cancelTarget.id)
      if (current?.status !== "en-analisis") {
        toast.info("Este pedido ya no puede cancelarse.")
        return
      }

      await updateOrder(cancelTarget.id, { status: "cancelado" })
      toast.success("Pedido cancelado")
      setAccountVersion((v) => v + 1)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos cancelar el pedido."
      )
      void loadOrders()
    } finally {
      setIsCancelling(false)
      setCancelId(null)
    }
  }

  const showInitialLoading = isLoading && sortedOrders.length === 0
  const showLoadError = Boolean(loadError) && sortedOrders.length === 0

  return (
    <ClientShell>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
          <header className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconReceipt className="size-4" aria-hidden />
              <span className="text-xs tracking-wider uppercase">Pedidos</span>
            </div>
            <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
              Mis pedidos
            </h1>
            <p className="text-sm text-muted-foreground">
              Consultá el estado de tus pedidos y el saldo de tu cuenta
              corriente.
            </p>
          </header>

          <AccountSection refreshKey={accountVersion} />

          <section
            className="flex flex-col gap-3"
            aria-labelledby="orders-list"
          >
            <div className="flex items-center justify-between gap-2">
              <h2 id="orders-list" className="text-sm font-medium">
                Historial de pedidos
              </h2>
              {sortedOrders.length > 0 ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                  {sortedOrders.length}
                </span>
              ) : null}
            </div>

            {loadError && sortedOrders.length > 0 ? (
              <p
                role="status"
                className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground"
              >
                No pudimos actualizar tus pedidos. Mostramos la última
                información guardada.
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
            ) : sortedOrders.length === 0 ? (
              <Empty className="max-w-md self-center py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconReceipt />
                  </EmptyMedia>
                  <EmptyTitle>Todavía no hiciste pedidos</EmptyTitle>
                  <EmptyDescription>
                    Cuando confirmes un pedido lo vas a ver acá.
                  </EmptyDescription>
                </EmptyHeader>
                <Button asChild variant="outline" size="sm">
                  <Link to="/catalogo">Ir al catálogo</Link>
                </Button>
              </Empty>
            ) : (
              <ul className="flex flex-col gap-3">
                {sortedOrders.map((order: Order) => (
                  <li key={order.id}>
                    <OrderCard
                      order={order}
                      onShowDetails={(o) => setSelectedId(o.id)}
                      onCancel={requestCancel}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {selectedOrder ? (
        <ClientOrderDetailDialog
          open
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
          order={selectedOrder}
          onCancelOrder={requestCancel}
        />
      ) : null}

      {cancelTarget ? (
        <CancelOrderDialog
          open
          onOpenChange={(open) => {
            if (!open) setCancelId(null)
          }}
          order={cancelTarget}
          isSubmitting={isCancelling}
          onConfirm={() => void confirmCancel()}
        />
      ) : null}
    </ClientShell>
  )
}

const HIGHLIGHT = "bg-primary/10 ring-2 ring-primary/40"

function AccountSection({ refreshKey }: { refreshKey: number }) {
  const state = useMyAccount(refreshKey)

  if (state.status === "loading") {
    return (
      <Card className={HIGHLIGHT}>
        <CardContent className="flex items-center justify-center py-8">
          <Spinner className="size-5 text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (state.status === "error") {
    return (
      <Card className={HIGHLIGHT}>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconWallet className="size-4 shrink-0" aria-hidden />
          <span>{state.message}</span>
        </CardContent>
      </Card>
    )
  }

  if (!state.account) {
    return (
      <Card className={HIGHLIGHT}>
        <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconWallet className="size-4 shrink-0" aria-hidden />
          <span>
            No tenés cuenta corriente habilitada. Contactá a tu vendedor para
            solicitarla.
          </span>
        </CardContent>
      </Card>
    )
  }

  return <AccountCard account={state.account} className={HIGHLIGHT} />
}
