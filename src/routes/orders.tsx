import { useCallback, useEffect, useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AccountCard } from "@/clients/ui/account-card"
import { useMyAccount } from "@/clients/use-my-account"
import { ClientShell } from "@/layout/client-shell"
import { ORDER_STATUSES, type Order, type OrderStatusId } from "@/orders/model"
import { selectOrdersNewestFirst, useOrdersStore } from "@/orders/store"
import { CancelOrderDialog } from "@/orders/ui/cancel-order-dialog"
import { OrderCard } from "@/orders/ui/order-card"
import { OrderDetailDialog } from "@/orders/ui/order-detail-dialog"

// "Activos" agrupa los estados que todavía no cerraron; "todos" no filtra.
type StatusFilter = "todos" | "activos" | OrderStatusId

const STATUS_FILTERS: ReadonlyArray<{ id: StatusFilter; label: string }> = [
  { id: "activos", label: "Activos" },
  ...ORDER_STATUSES.map((s) => ({ id: s.id, label: s.label })),
  { id: "todos", label: "Todos" },
]

const matchesStatus = (order: Order, filter: StatusFilter): boolean => {
  if (filter === "todos") return true
  if (filter === "activos") return order.status !== "cancelado"
  return order.status === filter
}

// Los inputs type="date" trabajan en horario local: se arma el rango también
// en horario local para no descartar pedidos del propio día por husos.
const matchesDateRange = (
  order: Order,
  dateFrom: string,
  dateTo: string
): boolean => {
  const createdAt = new Date(order.createdAt).getTime()
  if (dateFrom && createdAt < new Date(`${dateFrom}T00:00:00`).getTime()) {
    return false
  }
  if (dateTo && createdAt > new Date(`${dateTo}T23:59:59.999`).getTime()) {
    return false
  }
  return true
}

export function OrdersPage() {
  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
  }, [])

  const orders = useOrdersStore((s) => s.orders)
  const isLoading = useOrdersStore((s) => s.isLoading)
  const loadError = useOrdersStore((s) => s.loadError)
  const loadOrders = useOrdersStore((s) => s.loadOrders)
  const updateOrder = useOrdersStore((s) => s.updateOrder)
  const hydrateOrder = useOrdersStore((s) => s.hydrateOrder)

  useEffect(() => {
    void loadOrders()
  }, [loadOrders])

  const sortedOrders = useMemo(() => selectOrdersNewestFirst(orders), [orders])

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("activos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const hasFilters =
    statusFilter !== "activos" || dateFrom !== "" || dateTo !== ""
  const clearFilters = () => {
    setStatusFilter("activos")
    setDateFrom("")
    setDateTo("")
  }

  const filteredOrders = useMemo(
    () =>
      sortedOrders.filter(
        (order) =>
          matchesStatus(order, statusFilter) &&
          matchesDateRange(order, dateFrom, dateTo)
      ),
    [sortedOrders, statusFilter, dateFrom, dateTo]
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selectedOrder = sortedOrders.find((o) => o.id === selectedId)

  const [cancelId, setCancelId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [accountVersion, setAccountVersion] = useState(0)
  const cancelTarget = sortedOrders.find((o) => o.id === cancelId)

  // El listado no trae items: al abrir el detalle se piden con GET /orders/:id.
  // Se muestra "cargando" mientras no haya items ni error: en cuanto la
  // petición resuelve, uno de los dos deja de ser cierto.
  const [itemsError, setItemsError] = useState<string | null>(null)
  const isLoadingItems =
    selectedOrder !== undefined &&
    selectedOrder.items.length === 0 &&
    !itemsError

  const loadOrderItems = useCallback(
    (id: string) =>
      hydrateOrder(id)
        .then(() => setItemsError(null))
        .catch((error: unknown) => {
          setItemsError(
            error instanceof Error
              ? error.message
              : "No pudimos cargar el detalle del pedido."
          )
        }),
    [hydrateOrder]
  )

  useEffect(() => {
    if (!selectedOrder || selectedOrder.items.length > 0) return
    void loadOrderItems(selectedOrder.id)
  }, [selectedOrder, loadOrderItems])

  const requestCancel = (order: Order) => {
    setSelectedId(null)
    setCancelId(order.id)
  }

  const confirmCancel = async () => {
    if (!cancelTarget || isCancelling) return
    setIsCancelling(true)
    try {
      // El backend valida estado y dueño: si ya no se puede, responde con
      // un error claro.
      await updateOrder(cancelTarget.id, { status: "cancelado" })
      toast.success("Pedido cancelado")
      setAccountVersion((v) => v + 1)
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos cancelar el pedido."
      )
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
              {filteredOrders.length > 0 ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
                  {filteredOrders.length}
                </span>
              ) : null}
            </div>

            {sortedOrders.length > 0 ? (
              <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
                <ToggleGroup
                  type="single"
                  variant="outline"
                  size="sm"
                  value={statusFilter}
                  onValueChange={(value) => {
                    if (value) setStatusFilter(value as StatusFilter)
                  }}
                  className="flex-wrap justify-start"
                >
                  {STATUS_FILTERS.map((filter) => (
                    <ToggleGroupItem key={filter.id} value={filter.id}>
                      {filter.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="orders-date-from" className="sr-only">
                      Desde
                    </Label>
                    <Input
                      id="orders-date-from"
                      type="date"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">a</span>
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="orders-date-to" className="sr-only">
                      Hasta
                    </Label>
                    <Input
                      id="orders-date-to"
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  {hasFilters ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                    >
                      Limpiar
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

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
            ) : filteredOrders.length === 0 ? (
              <Empty className="max-w-md self-center py-10">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <IconInbox />
                  </EmptyMedia>
                  <EmptyTitle>Sin resultados</EmptyTitle>
                  <EmptyDescription>
                    Ningún pedido coincide con estos filtros.
                  </EmptyDescription>
                </EmptyHeader>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </Button>
              </Empty>
            ) : (
              <ul className="flex flex-col gap-3">
                {filteredOrders.map((order: Order) => (
                  <li key={order.id}>
                    <OrderCard
                      order={order}
                      onShowDetails={(o) => {
                        setItemsError(null)
                        setSelectedId(o.id)
                      }}
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
        <OrderDetailDialog
          open
          onOpenChange={(open) => {
            if (!open) setSelectedId(null)
          }}
          order={selectedOrder}
          onCancelOrder={requestCancel}
          isLoadingItems={isLoadingItems}
          itemsError={itemsError}
          onRetryItems={() => {
            setItemsError(null)
            void loadOrderItems(selectedOrder.id)
          }}
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
