import { Button } from "@/components/ui/button"
import type { Order, OrderStatusId } from "@/orders/model"
import { IconChartBar, IconX } from "@tabler/icons-react"

export type OrderStatusDistributionProps = {
  orders: Order[]
  selectedStatus: OrderStatusId | "all"
  onSelectStatus: (status: OrderStatusId | "all") => void
}

type StatusItemConfig = {
  readonly id: OrderStatusId
  readonly label: string
  readonly barClass: string
  readonly activeClass: string
  readonly textClass: string
}

const STATUS_ITEMS: ReadonlyArray<StatusItemConfig> = [
  {
    id: "en-analisis",
    label: "En Análisis",
    barClass: "bg-amber-500",
    activeClass: "bg-amber-500/10 ring-1 ring-amber-500",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  {
    id: "en-proceso",
    label: "En Proceso",
    barClass: "bg-blue-500",
    activeClass: "bg-blue-500/10 ring-1 ring-blue-500",
    textClass: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "entregado",
    label: "Entregados",
    barClass: "bg-emerald-500",
    activeClass: "bg-emerald-500/10 ring-1 ring-emerald-500",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  {
    id: "cancelado",
    label: "Cancelados",
    barClass: "bg-destructive",
    activeClass: "bg-destructive/10 ring-1 ring-destructive",
    textClass: "text-destructive",
  },
]

/**
 * Interactive visual distribution chart for order statuses.
 * Clicking any bar filters the associated view.
 */
export function OrderStatusDistribution({
  orders,
  selectedStatus,
  onSelectStatus,
}: OrderStatusDistributionProps) {
  const total = orders.length

  const counts: Record<OrderStatusId, number> = {
    "en-analisis": orders.filter((o) => o.status === "en-analisis").length,
    "en-proceso": orders.filter((o) => o.status === "en-proceso").length,
    entregado: orders.filter((o) => o.status === "entregado").length,
    cancelado: orders.filter((o) => o.status === "cancelado").length,
  }

  const maxCount = Math.max(...Object.values(counts), 1)

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconChartBar className="size-4 text-primary" aria-hidden />
          <h3 className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Distribución por Estado
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground italic">
          Clic en una barra para filtrar
        </span>
      </div>

      <div className="flex flex-col gap-2.5 py-1">
        {STATUS_ITEMS.map((item) => {
          const count = counts[item.id]
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0
          const barWidthPercent = Math.max(
            (count / maxCount) * 100,
            count > 0 ? 8 : 2
          )
          const isSelected = selectedStatus === item.id

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectStatus(isSelected ? "all" : item.id)}
              className={`group flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 text-left transition-all hover:bg-muted/50 ${
                isSelected ? item.activeClass : ""
              }`}
              aria-pressed={isSelected}
              aria-label={`Filtrar por ${item.label}: ${count} pedidos (${percentage}%)`}
            >
              <div className="flex w-24 shrink-0 flex-col">
                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                  {item.label}
                </span>
                <span className="text-[10px] text-muted-foreground tabular-nums">
                  {percentage}%
                </span>
              </div>

              <div className="relative h-3.5 flex-1 overflow-hidden rounded-full bg-muted/70">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${item.barClass}`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              <span
                className={`w-12 text-right text-sm font-bold tabular-nums ${item.textClass}`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-muted-foreground">
        <span>
          Filtro actual:{" "}
          <strong className="text-foreground uppercase">
            {selectedStatus === "all"
              ? "Todos los estados"
              : STATUS_ITEMS.find((i) => i.id === selectedStatus)?.label}
          </strong>
        </span>

        {selectedStatus !== "all" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectStatus("all")}
            className="h-6 gap-1 px-2 text-xs font-medium hover:bg-muted"
          >
            <IconX className="size-3" aria-hidden />
            Limpiar filtro
          </Button>
        )}
      </div>
    </div>
  )
}
