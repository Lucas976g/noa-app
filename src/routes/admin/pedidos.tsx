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
import { fetchOrders, updateOrder } from "@/orders/api"
import type { Order } from "@/orders/model"
import { getOrderStatus, PAYMENT_METHODS } from "@/orders/model"
import { ProcessOrderDialog } from "@/orders/ui/process-order-dialog"
import { formatCurrency, formatDate } from "@/shared/lib/format"

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
    await updateOrder(selectedOrder.id, { status: "en-proceso" })
    setOrders((current) =>
      current.filter((order) => order.id !== selectedOrder.id)
    )
    setSelectedOrder(null)
  }

  const handleCancel = async (reason: string) => {
    if (!selectedOrder) return
    await updateOrder(selectedOrder.id, {
      status: "cancelado",
      cancelReason: reason,
    })
    setOrders((current) =>
      current.filter((order) => order.id !== selectedOrder.id)
    )
    setSelectedOrder(null)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
          Pedidos
        </h1>
        <p className="text-sm text-muted-foreground">
          Revisá los pedidos pendientes de análisis y decidí cómo procesarlos.
        </p>
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
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-right">Acción</TableHead>
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
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs uppercase">
                      {order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.userName}
                    </TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {quantity}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(order.subtotal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment?.label ?? order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
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
          onCancel={(reason) => void handleCancel(reason)}
        />
      ) : null}
    </div>
  )
}