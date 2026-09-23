import { useEffect, useState } from "react"
import { IconInbox } from "@tabler/icons-react"

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
import { cancelOrder, fetchOrders, updateOrder } from "@/orders/api"
import type { Order } from "@/orders/model"
import { getOrderStatus, PAYMENT_METHODS } from "@/orders/model"
import { ProcessOrderDialog } from "@/orders/ui/process-order-dialog"
import { formatCurrency, formatDate } from "@/shared/lib/format"
import { toast } from "sonner"

export function AdminPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"

    let active = true
    void fetchOrders()
      .then((loadedOrders) => {
        if (!active) return
        // Filtramos solo los pedidos que están pendientes de análisis
        setOrders(loadedOrders.filter((order) => order.status === "en-analisis"))
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No pudimos cargar los pedidos."
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleApprove = async () => {
    if (!selectedOrder) return
    const orderId = selectedOrder.id
    const clientName = selectedOrder.userName
    try {
      await updateOrder(orderId, { status: "en-proceso" })
      setOrders((current) => current.filter((order) => order.id !== orderId))
      setSelectedOrder(null)
      toast.success("Pedido aprobado con éxito", {
        description: `El pedido de ${clientName} (#${orderId.slice(0, 8).toUpperCase()}) pasó a "En proceso".`,
      })
    } catch (err) {
      toast.error("Error al aprobar el pedido", {
        description:
          err instanceof Error
            ? err.message
            : "No pudimos procesar la aprobación del pedido.",
      })
    }
  }

  const handleCancel = async (reason: string, observations?: string) => {
    if (!selectedOrder) return
    const orderId = selectedOrder.id
    const clientName = selectedOrder.userName
    try {
      await cancelOrder(orderId, {
        reason,
        observations: observations ?? "",
      })
      setOrders((current) => current.filter((order) => order.id !== orderId))
      setSelectedOrder(null)
      toast.success("Pedido cancelado", {
        description: `El pedido de ${clientName} (#${orderId.slice(0, 8).toUpperCase()}) fue cancelado correctamente.`,
      })
    } catch (err) {
      toast.error("Error al cancelar el pedido", {
        description:
          err instanceof Error
            ? err.message
            : "No pudimos completar la cancelación.",
      })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
              Pedidos
            </h1>
            {!loading && orders.length > 0 && (
              <Badge variant="secondary" className="font-medium text-xs">
                {orders.length} {orders.length === 1 ? "pendiente" : "pendientes"}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Revisá los pedidos pendientes de análisis y decidí cómo procesarlos.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : error ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>Error al cargar pedidos</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : orders.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconInbox />
            </EmptyMedia>
            <EmptyTitle>No hay pedidos pendientes</EmptyTitle>
            <EmptyDescription>
              Los pedidos en análisis aparecerán en esta lista.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-xs overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-center w-28">ID</TableHead>
                <TableHead className="text-left">Cliente</TableHead>
                <TableHead className="text-center">Fecha</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Pago</TableHead>
                <TableHead className="text-center w-28">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = getOrderStatus(order.status)
                const payment = PAYMENT_METHODS.find(
                  (method) => method.id === order.paymentMethod
                )
                const quantity = order.items.reduce(
                  (total, item) => total + item.quantity,
                  0
                )

                return (
                  <TableRow key={order.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="text-center font-mono text-xs font-semibold text-muted-foreground">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{order.userName}</span>
                        {order.deliveryAddress && (
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[260px]" title={order.deliveryAddress}>
                            {order.deliveryAddress}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground text-xs whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-center tabular-nums">
                      {order.items && order.items.length > 0 ? (
                        <span className="font-medium">{quantity}</span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold tabular-nums text-foreground">
                      {formatCurrency(order.subtotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">
                        {payment?.label ?? order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                        className="font-medium"
                      >
                        Procesar
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {selectedOrder ? (
        <ProcessOrderDialog
          open
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null)
          }}
          order={selectedOrder}
          onApprove={() => void handleApprove()}
          onCancel={(reason, observations) =>
            void handleCancel(reason, observations)
          }
        />
      ) : null}
    </div>
  )
}