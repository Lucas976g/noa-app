import { useEffect, useState } from "react"
import { IconChartBar, IconTruck } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
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
import { fetchOrders } from "@/orders/api"
import type { Order, OrderStatusId, PaymentMethod } from "@/orders/model"
import { getOrderStatus, PAYMENT_METHODS } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"
import { Button } from "@/components/ui/button"

export function AdminMonitoreoPage() {
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

  // Cálculos para métricas y gráficos
  const totalOrders = orders.length
  const countAnalisis = orders.filter((o) => o.status === "en-analisis").length
  const countProceso = orders.filter((o) => o.status === "en-proceso").length
  const countEntregados = orders.filter((o) => o.status === "entregado").length
  const countCancelados = orders.filter((o) => o.status === "cancelado").length

  const countCC = orders.filter((o) => o.paymentMethod === "cuenta-corriente").length
  const countContado = orders.filter((o) => o.paymentMethod === "contado").length

  const maxStatusCount = Math.max(countAnalisis, countProceso, countEntregados, countCancelados, 1)

  // Filtrado de pedidos para la tabla de seguimiento
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
          Monitoreo de Pedidos
        </h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento y control de los pedidos en tiempo real.
        </p>
      </header>

      {/* SECCIÓN DE GRÁFICOS Y MÉTRICAS */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        
        {/* Gráfico de Estados */}
        <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <IconChartBar className="size-4 text-primary" />
              <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Estados de los Pedidos</h2>
            </div>
            <span className="text-[11px] text-muted-foreground italic">Haz clic en una barra para filtrar</span>
          </div>

          <div className="flex flex-col gap-3 py-2">
            {/* Barra En Análisis */}
            <button 
              type="button" 
              onClick={() => setStatusFilter("en-analisis")}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all text-left group cursor-pointer hover:bg-muted/50 ${statusFilter === "en-analisis" ? "bg-amber-500/10 ring-1 ring-amber-500" : ""}`}
            >
              <span className="text-xs font-medium w-24 text-muted-foreground group-hover:text-foreground">En Análisis</span>
              <div className="flex-1 bg-muted/60 h-4 rounded-full overflow-hidden relative">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max((countAnalisis / maxStatusCount) * 100, countAnalisis > 0 ? 8 : 2)}%` }}
                />
              </div>
              <span className="text-base font-bold w-12 text-right text-amber-500">{countAnalisis}</span>
            </button>

            {/* Barra En Proceso */}
            <button 
              type="button" 
              onClick={() => setStatusFilter("en-proceso")}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all text-left group cursor-pointer hover:bg-muted/50 ${statusFilter === "en-proceso" ? "bg-blue-500/10 ring-1 ring-blue-500" : ""}`}
            >
              <span className="text-xs font-medium w-24 text-muted-foreground group-hover:text-foreground">En Proceso</span>
              <div className="flex-1 bg-muted/60 h-4 rounded-full overflow-hidden relative">
                <div 
                  className="bg-blue-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max((countProceso / maxStatusCount) * 100, countProceso > 0 ? 8 : 2)}%` }}
                />
              </div>
              <span className="text-base font-bold w-12 text-right text-blue-500">{countProceso}</span>
            </button>

            {/* Barra Entregados */}
            <button 
              type="button" 
              onClick={() => setStatusFilter("entregado")}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all text-left group cursor-pointer hover:bg-muted/50 ${statusFilter === "entregado" ? "bg-emerald-500/10 ring-1 ring-emerald-500" : ""}`}
            >
              <span className="text-xs font-medium w-24 text-muted-foreground group-hover:text-foreground">Entregados</span>
              <div className="flex-1 bg-muted/60 h-4 rounded-full overflow-hidden relative">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${Math.max((countEntregados / maxStatusCount) * 100, countEntregados > 0 ? 8 : 2)}%` }}
                />
              </div>
              <span className="text-base font-bold w-12 text-right text-emerald-500">{countEntregados}</span>
            </button>

            {/* Barra Cancelados */}
            <button 
              type="button" 
              onClick={() => setStatusFilter("cancelado")}
              className={`flex items-center gap-3 w-full p-2 rounded-lg transition-all text-left group cursor-pointer hover:bg-muted/50 ${statusFilter === "cancelado" ? "bg-destructive/10 ring-1 ring-destructive" : ""}`}
            >
              <span className="text-xs font-medium w-24 text-muted-foreground group-hover:text-foreground">Cancelados</span>
              <div className="flex-1 bg-muted/60 h-4 rounded-full overflow-hidden relative">
                <div 
                  className="bg-destructive h-full rounded-full transition-all"
                  style={{ width: `${Math.max((countCancelados / maxStatusCount) * 100, countCancelados > 0 ? 8 : 2)}%` }}
                />
              </div>
              <span className="text-base font-bold w-12 text-right text-destructive">{countCancelados}</span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t border-border/60">
            <span>Filtro actual: <strong className="text-foreground uppercase">{statusFilter}</strong></span>
            {statusFilter !== "all" && (
              <button 
                type="button" 
                onClick={() => setStatusFilter("all")} 
                className="text-primary hover:underline font-medium"
              >
                Limpiar filtro de estado
              </button>
            )}
          </div>
        </div>

        {/* Resumen de Pagos y Filtro Rápido */}
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">Resumen de Pagos</h2>
            <span className="text-lg font-bold">Total: {totalOrders}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 my-2">
            <div className="rounded-lg bg-muted/40 p-3 flex flex-col justify-between border border-border/50">
              <span className="text-[11px] text-muted-foreground font-medium">Cuenta Corriente</span>
              <span className="text-xl font-bold mt-1 text-primary">{countCC}</span>
            </div>
            <div className="rounded-lg bg-muted/40 p-3 flex flex-col justify-between border border-border/50">
              <span className="text-[11px] text-muted-foreground font-medium">Contado</span>
              <span className="text-xl font-bold mt-1">{countContado}</span>
            </div>
          </div>

          <div className="border-t border-border pt-3 flex flex-col gap-1.5">
            <span className="text-[11px] text-muted-foreground">Filtro rápido de pago:</span>
            <div className="grid grid-cols-3 gap-1.5">
              <Button
                variant={paymentFilter === "all" ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${paymentFilter === "all" ? "font-semibold shadow-sm" : "text-muted-foreground"}`}
                onClick={() => setPaymentFilter("all")}
              >
                Todos
              </Button>
              <Button
                variant={paymentFilter === "cuenta-corriente" ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${paymentFilter === "cuenta-corriente" ? "font-semibold shadow-sm" : "text-muted-foreground"}`}
                onClick={() => setPaymentFilter("cuenta-corriente")}
              >
                Cta. Cte.
              </Button>
              <Button
                variant={paymentFilter === "contado" ? "default" : "outline"}
                size="sm"
                className={`text-xs h-7 ${paymentFilter === "contado" ? "font-semibold shadow-sm" : "text-muted-foreground"}`}
                onClick={() => setPaymentFilter("contado")}
              >
                Contado
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* TABLA DE SEGUIMIENTO */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Input
            placeholder="Buscar por ID, cliente o dirección..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md h-9 text-xs"
          />
          <span className="text-xs text-muted-foreground">
            Mostrando <strong className="text-foreground">{filteredOrders.length}</strong> pedidos en seguimiento
          </span>
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
              <EmptyTitle>Error al cargar monitoreo</EmptyTitle>
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
                No hay registros que coincidan con los filtros seleccionados.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Medio de pago</TableHead>
                  <TableHead className="text-right">Estado Actual</TableHead>
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
                      <TableCell className="text-right">
                        <Badge variant={status.tone}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}