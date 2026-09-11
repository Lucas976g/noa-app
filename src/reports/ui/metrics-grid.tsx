import type { ReactNode } from "react"
import {
  IconBuildingBank,
  IconCash,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react"

import { formatCurrency } from "@/shared/lib/format"
import type { CashClosing } from "@/reports/model"

type MetricsGridProps = {
  closing: CashClosing
}

export function MetricsGrid({ closing }: MetricsGridProps) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<IconCash className="size-4" aria-hidden />}
        label="Total recaudado"
        value={formatCurrency(closing.totalCollected)}
        detail={`${closing.deliveryCount} entregas`}
      />
      <MetricCard
        icon={<IconBuildingBank className="size-4" aria-hidden />}
        label="Saldo final en caja"
        value={formatCurrency(closing.balanceAfter)}
        detail={`Base ${formatCurrency(closing.baseBalance)} + acumulado`}
      />
      <MetricCard
        icon={<IconCircleCheck className="size-4" aria-hidden />}
        label="Pedidos entregados"
        value={closing.deliveredCount.toString()}
        detail="entregas exitosas"
      />
      <MetricCard
        icon={<IconCircleX className="size-4" aria-hidden />}
        label="Rechazos"
        value={closing.rejectedCount.toString()}
        detail="pedidos cancelados"
      />
    </section>
  )
}

type MetricCardProps = {
  icon: ReactNode
  label: string
  value: string
  detail: string
}

function MetricCard({ icon, label, value, detail }: MetricCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40">
      <div
        className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        aria-hidden
      >
        {icon}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="text-xs tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
        <span className="truncate text-lg font-semibold tabular-nums">
          {value}
        </span>
        <span className="truncate text-xs text-muted-foreground">
          {detail}
        </span>
      </div>
    </div>
  )
}
