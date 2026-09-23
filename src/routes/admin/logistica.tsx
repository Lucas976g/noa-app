import { useEffect, useState } from "react"
import { IconTruck } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
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
import type { Order, OrderStatusId, PaymentMethod } from "@/orders/model"
import { getOrderStatus, PAYMENT_METHODS } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"

export function AdminLogisticaPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatusId | "all">("all")
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | "all">("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    document.title = "Monitoreo de los pedidos · Distribuidora NOA"

    let active = true
    void fetchOrders()
      .then((loadedOrders) => {
        if (!active) return
        setOrders(loadedOrders)
      })
      .catch((loadError: unknown) => {
        if (!active) return
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No pudimos cargar los pedidos de monitoreo."
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleRegisterDelivery = async (id: string) => {
    await updateOrder(id, { status: "entregado" })
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: "entregado" } : order
      )
    )
  }

  const handleCancelDelivery = async (id: string) => {
    await updateOrder(id, { status: "cancelado", cancelReason: "Cancelado desde monitoreo" })
    setOrders((current) =>
      current.map((order) =>
        order.id === id ? { ...order, status: "cancelado" } : order
      )
    )
  }

  // Filtrado de pedidos
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesPayment = paymentFilter === "all" || order.paymentMethod === paymentFilter
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.deliveryAddress ?? "").toLowerCase().includes(searchTerm.toLowerCase())

    return matchesStatus && matchesPayment && matchesSearch
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
      <header className="flex flex-col gap-1">
      <h1 className="font-heading text-[1.65rem] font-semibold tracking-tight">
        Monitoreo de Estados
      </h1>
      <p className="text-sm text-muted-foreground">
        Seguimiento en tiempo real de los estados de los pedidos y control operativo.
      </p>
  </header>

      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            placeholder="Buscar por ID o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <div className="flex flex-wrap items-center gap-1.5">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Todos los estados
            </Button>
            <Button
              variant={statusFilter === "en-analisis" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("en-analisis")}
            >
              En análisis
            </Button>
            <Button
              variant={statusFilter === "en-proceso" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("en-proceso")}
            >
              En proceso
            </Button>
            <Button
              variant={statusFilter === "entregado" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("entregado")}
            >
              Entregados
            </Button>
            <Button
              variant={statusFilter === "cancelado" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("cancelado")}
            >
              Cancelados
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <span className="text-xs text-muted-foreground">Medio de pago:</span>
          <Button
            variant={paymentFilter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPaymentFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={paymentFilter === "cuenta-corriente" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPaymentFilter("cuenta-corriente")}
          >
            Cta. cte.
          </Button>
          <Button
            variant={paymentFilter === "contado" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPaymentFilter("contado")}
          >
            Contado
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Spinner className="size-6 text-muted-foreground" />
        </div>
      ) : error ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconTruck />
            </EmptyMedia>
            <EmptyTitle>Error al cargar logística</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : filteredOrders.length === 0 ? (
        <Empty className="border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <IconTruck />
            </EmptyMedia>
            <EmptyTitle>No se encontraron pedidos</EmptyTitle>
            <EmptyDescription>
              No hay pedidos que coincidan con los filtros seleccionados.
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
                <TableHead>Dirección</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Medio de pago</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const status = getOrderStatus(order.status)
                const payment = PAYMENT_METHODS.find(
                  (method) => method.id === order.paymentMethod
                )

                return (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs uppercase">
                      {order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell className="font-medium">
                      {order.userName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {order.deliveryAddress ?? "Sin dirección especificada"}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(order.subtotal)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment?.label ?? order.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === "en-proceso" && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => void handleCancelDelivery(order.id)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => void handleRegisterDelivery(order.id)}
                            >
                              Registrar entrega ✓
                            </Button>
                          </>
                        )}
                        {order.status !== "en-proceso" && (
                          <span className="text-xs text-muted-foreground italic">
                            {order.status === "en-analisis" ? "Pendiente de revisión" : "Completado"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}