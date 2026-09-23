import { IconWallet } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { type CashClosing, type CashClosingMethod } from "@/reports/model"
import { CASH_CLOSING_METHODS } from "@/reports/lib"
import { formatCurrency } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

type PaymentMethodsChartProps = {
  closing: CashClosing
}

const PIE_COLORS: Record<CashClosingMethod, string> = {
  efectivo: "var(--color-primary)",
  transferencia: "oklch(0.62 0.18 250)",
  "imputacion-cta-cte": "oklch(0.72 0.18 75)",
}

export function PaymentMethodsChart({ closing }: PaymentMethodsChartProps) {
  const total = closing.totalCollected
  const methods = CASH_CLOSING_METHODS.map((method) => {
    const summary = closing.paymentMethods[method.id as CashClosingMethod]
    const percentage = total > 0 ? (summary.amount / total) * 100 : 0
    const color = PIE_COLORS[method.id as CashClosingMethod]
    return { method, summary, percentage, color }
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconWallet className="size-3.5" aria-hidden />
          <span className="text-xs tracking-wider uppercase">
            Métodos de pago
          </span>
        </div>
        <CardTitle>Distribución de métodos de pago</CardTitle>
        <CardDescription>
          Monto cobrado por forma de pago en el cierre
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <DonutChart methods={methods} total={total} />

        <div className="flex flex-col gap-3">
          {methods.map(({ method, summary, percentage, color }) => (
            <div key={method.id} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block size-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                  <span className="font-medium">{method.label}</span>
                  <Badge variant="outline" className="ml-1 font-normal">
                    {summary.count}{" "}
                    {summary.count === 1 ? "entrega" : "entregas"}
                  </Badge>
                </div>
                <span className="text-muted-foreground tabular-nums">
                  {formatCurrency(summary.amount)} · {percentage.toFixed(1)}%
                </span>
              </div>
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.round(percentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Porcentaje de ${method.label}`}
              >
                <div
                  className={cn(
                    "h-full transition-all",
                    percentage > 0 ? "" : "bg-transparent"
                  )}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: percentage > 0 ? color : "transparent",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

type DonutMethod = {
  method: { id: string; label: string }
  summary: { count: number; amount: number }
  percentage: number
  color: string
}

type DonutChartProps = {
  methods: ReadonlyArray<DonutMethod>
  total: number
}

function DonutChart({ methods, total }: DonutChartProps) {
  const size = 176
  const stroke = 22
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const center = size / 2

  const visibleMethods = methods.filter((m) => m.summary.amount > 0)
  const hasData = total > 0 && visibleMethods.length > 0

  if (!hasData) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="flex items-center justify-center rounded-full border-4 border-dashed border-border"
          style={{ width: size, height: size }}
        >
          <span className="text-xs text-muted-foreground">Sin datos</span>
        </div>
      </div>
    )
  }

  const segments = visibleMethods.reduce<
    Array<{
      method: DonutMethod
      length: number
      offset: number
    }>
  >((acc, m, index) => {
    const length = (m.summary.amount / total) * circumference
    const offset = index === 0 ? 0 : acc.reduce((sum, s) => sum + s.length, 0)
    acc.push({ method: m, length, offset })
    return acc
  }, [])

  return (
    <div className="flex items-center justify-center gap-5">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Distribución de métodos de pago"
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="var(--color-muted)"
            strokeWidth={stroke}
          />
          {segments.map((segment) => (
            <circle
              key={segment.method.method.id}
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke={segment.method.color}
              strokeWidth={stroke}
              strokeDasharray={`${segment.length} ${circumference - segment.length}`}
              strokeDashoffset={-segment.offset}
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs tracking-wider text-muted-foreground uppercase">
            Total
          </span>
          <span className="text-base font-semibold tabular-nums">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  )
}
