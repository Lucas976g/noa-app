import { useCallback, useEffect, useMemo, useState } from "react"
import { IconEye, IconInbox, IconRefresh } from "@tabler/icons-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { clientLabel } from "@/logistics/client-label"
import type { OrderStatusId, PaymentMethod } from "@/orders/model"
import { PAYMENT_METHODS } from "@/orders/model"
import { useOrdersStore } from "@/orders/store"
import { OrderDetailDialog } from "@/orders/ui/order-detail-dialog"
import { OrderMetricsCards } from "@/orders/ui/order-metrics-cards"
import { OrdersFiltersBar } from "@/orders/ui/orders-filters-bar"
import { OrdersPagination } from "@/orders/ui/orders-pagination"
import { OrderStatusBadge } from "@/orders/ui/order-status-badge"
import { OrderStatusDistribution } from "@/orders/ui/order-status-distribution"
import { formatCurrency, formatDate } from "@/shared/lib/format"

const PAGE_SIZE = 10

/**
 * Admin monitoring dashboard page for real-time visibility into all orders,
 * lifecycle progression metrics, payment distribution, and detailed inspection.
 */
export function AdminMonitoreoPage() {
  const orders = useOrdersStore((s) => s.orders)
  const isLoading = useOrdersStore((s) => s.isLoading)
  const loadError = useOrdersStore((s) => s.loadError)
  const loadOrders = useOrdersStore((s) => s.loadOrders)
  const hydrateOrder = useOrdersStore((s) => s.hydrateOrder)

  const [statusFilter, setStatusFilter] = useState<OrderStatusId | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "all">(
    "all"
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Order inspection state for OrderDetailDialog
  const [inspectId, setInspectId] = useState<string | null>(null)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const inspectOrder = orders.find((o) => o.id === inspectId)

  const isLoadingItems =
    inspectOrder !== undefined && inspectOrder.items.length === 0 && !itemsError

  const loadOrderItems = useCallback(
    (id: string) =>
      hydrateOrder(id)
        .then(() => setItemsError(null))
        .catch((error: unknown) => {
          setItemsError(
            error instanceof Error
              ? error.message
              : "No pudimos cargar el detalle de los productos."
          )
        }),
    [hydrateOrder]
  )

  useEffect(() => {
    document.title = "Monitoreo de Pedidos · Distribuidora NOA"
    void loadOrders()
  }, [loadOrders])

  useEffect(() => {
    if (inspectId) {
      void loadOrderItems(inspectId)
    }
  }, [inspectId, loadOrderItems])

  // Count distribution across all orders
  const statusCounts = useMemo<Record<OrderStatusId | "all", number>>(
    () => ({
      all: orders.length,
      "en-analisis": orders.filter((o) => o.status === "en-analisis").length,
      "en-proceso": orders.filter((o) => o.status === "en-proceso").length,
      entregado: orders.filter((o) => o.status === "entregado").length,
      cancelado: orders.filter((o) => o.status === "cancelado").length,
    }),
    [orders]
  )

  // Filter orders matching status, payment, and search term
  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter
      const matchesPayment =
        paymentFilter === "all" || order.paymentMethod === paymentFilter
      if (!matchesStatus || !matchesPayment) return false

      if (!query) return true
      return (
        order.id.toLowerCase().includes(query) ||
        order.userName.toLowerCase().includes(query) ||
        (order.deliveryAddress ?? "").toLowerCase().includes(query)
      )
    })
  }, [orders, statusFilter, paymentFilter, searchTerm])

  const handleSearchChange = (query: string) => {
    setSearchTerm(query)
    setCurrentPage(1)
  }

  const handleStatusChange = (status: OrderStatusId | "all") => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handlePaymentChange = (payment: PaymentMethod | "all") => {
    setPaymentFilter(payment)
    setCurrentPage(1)
  }

  // Calculate total pages and safe clamped page
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)

  const paginatedOrders = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * PAGE_SIZE
    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE)
  }, [filteredOrders, safeCurrentPage])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadOrders()
      toast.success("Datos de monitoreo actualizados")
    } catch {
      toast.error("No pudimos actualizar los datos")
    } finally {
      setIsRefreshing(false)
    }
  }

  const showInitialLoading = isLoading && orders.length === 0

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      {/* Top Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
            Monitoreo de Pedidos
          </h1>
          <p className="text-sm text-muted-foreground">
            Seguimiento en tiempo real de los estados de los pedidos y control
            operativo del flujo comercial.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void handleRefresh()}
          disabled={isLoading || isRefreshing}
          className="gap-1.5 self-start text-xs font-medium sm:self-auto"
        >
          <IconRefresh
            className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            aria-hidden
          />
          <span>Actualizar</span>
        </Button>
      </header>

      {/* KPI METRICS AND DISTRIBUTION VISUALS */}
      <div className="flex flex-col gap-4">
        {/* KPI Cards */}
        <OrderMetricsCards orders={orders} />

        {/* Status Distribution Bar Chart */}
        <OrderStatusDistribution
          orders={orders}
          selectedStatus={statusFilter}
          onSelectStatus={handleStatusChange}
        />
      </div>

      {/* FILTER CONTROLS BAR */}
      <OrdersFiltersBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        paymentFilter={paymentFilter}
        onPaymentChange={handlePaymentChange}
        statusCounts={statusCounts}
        placeholder="Buscar en monitoreo por ID, cliente o dirección..."
      />

      {/* ORDERS TRACKING TABLE */}
      {showInitialLoading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : loadError && orders.length === 0 ? (
        <Empty className="border border-dashed py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Error al cargar monitoreo</EmptyTitle>
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
      ) : orders.length === 0 ? (
        <Empty className="border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Sin pedidos registrados</EmptyTitle>
            <EmptyDescription>
              Aún no se han recibido pedidos en el sistema.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredOrders.length === 0 ? (
        <Empty className="border border-dashed py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Sin resultados</EmptyTitle>
            <EmptyDescription>
              No hay pedidos que coincidan con los filtros seleccionados.
            </EmptyDescription>
          </EmptyHeader>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setPaymentFilter("all")
            }}
          >
            Limpiar filtros
          </Button>
        </Empty>
      ) : (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-28 text-center">ID</TableHead>
                <TableHead className="text-left">Cliente</TableHead>
                <TableHead className="text-center">Fecha</TableHead>
                <TableHead className="text-left">
                  Dirección de Entrega
                </TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Pago</TableHead>
                <TableHead className="text-center">Estado Actual</TableHead>
                <TableHead className="w-28 text-center">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => {
                const payment = PAYMENT_METHODS.find(
                  (method) => method.id === order.paymentMethod
                )

                return (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => setInspectId(order.id)}
                  >
                    <TableCell className="text-center font-mono text-xs font-semibold text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-left font-medium text-foreground">
                      {order.userName}
                    </TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-[220px] truncate text-left text-xs text-muted-foreground">
                      {order.deliveryAddress ?? "Sin dirección especificada"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground tabular-nums">
                      {formatCurrency(order.subtotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {payment?.label ?? order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectId(order.id)}
                        className="h-8 gap-1 px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <IconEye className="size-3.5" aria-hidden />
                        <span>Detalle</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {/* Table Pagination */}
          <OrdersPagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Order Detail Modal Inspection */}
      {inspectOrder ? (
        <OrderDetailDialog
          open
          onOpenChange={(open) => {
            if (!open) {
              setInspectId(null)
              setItemsError(null)
            }
          }}
          order={inspectOrder}
          clientName={clientLabel(inspectOrder)}
          isLoadingItems={isLoadingItems}
          itemsError={itemsError}
          onRetryItems={() => {
            setItemsError(null)
            void loadOrderItems(inspectOrder.id)
          }}
        />
      ) : null}
    </div>
  )
}
