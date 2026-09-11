import { IconActivity, IconMessage } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { CashClosing } from "@/reports/model"
import { cn } from "@/shared/lib/utils"

type EfficiencySectionProps = {
  closing: CashClosing
}

export function EfficiencySection({ closing }: EfficiencySectionProps) {
  const total = closing.deliveredCount + closing.rejectedCount
  const successRate =
    total > 0 ? (closing.deliveredCount / total) * 100 : 100

  const isGoodRate = successRate >= 80
  const isWarningRate = successRate >= 50 && successRate < 80
  const hasRejections = closing.rejectedCount > 0
  const samples = closing.rejectionSamples

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconActivity className="size-3.5" aria-hidden />
          <span className="text-xs tracking-wider uppercase">Eficiencia</span>
        </div>
        <CardTitle>Métricas operativas</CardTitle>
        <CardDescription>
          Tasa de entregas exitosas y motivos de rechazo
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Tasa de éxito
            </span>
            <span
              className={cn(
                "text-2xl font-semibold tabular-nums",
                isGoodRate
                  ? "text-foreground"
                  : isWarningRate
                    ? "text-foreground"
                    : "text-destructive"
              )}
            >
              {successRate.toFixed(1)}%
            </span>
          </div>
          <div
            className="h-2 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(successRate)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Tasa de éxito"
          >
            <div
              className={cn(
                "h-full transition-all",
                isGoodRate
                  ? "bg-primary"
                  : isWarningRate
                    ? "bg-primary/70"
                    : "bg-destructive"
              )}
              style={{ width: `${successRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {closing.deliveredCount} entregas · {closing.rejectedCount}{" "}
              rechazos
            </span>
            <span>{total} operaciones</span>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Motivos de rechazo</span>
            <Badge variant={hasRejections ? "destructive" : "outline"}>
              {closing.rejectedCount}
            </Badge>
          </div>
          {samples.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {hasRejections
                ? "No se registraron motivos para los rechazos."
                : "No se registraron rechazos en este cierre."}
            </p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {samples.map((reason, index) => (
                <li
                  key={`${index}-${reason}`}
                  className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  <IconMessage
                    className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="text-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
