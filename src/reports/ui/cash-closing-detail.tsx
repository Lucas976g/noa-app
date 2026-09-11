import {
  IconCheck,
  IconCircleX,
  IconClock,
  IconReceipt,
  IconTruckDelivery,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EfficiencySection } from "@/reports/ui/efficiency-section"
import { MetricsGrid } from "@/reports/ui/metrics-grid"
import { PaymentMethodsChart } from "@/reports/ui/payment-methods-chart"
import { formatCurrency, formatDateTime } from "@/shared/lib/format"
import type { CashClosing, ClosingOperation } from "@/reports/model"

type CashClosingDetailProps = {
  closing: CashClosing
}

export function CashClosingDetail({ closing }: CashClosingDetailProps) {
  return (
    <div className="flex flex-col gap-6">
      <MetricsGrid closing={closing} />

      <section className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        <PaymentMethodsChart closing={closing} />
        <EfficiencySection closing={closing} />
      </section>

      <Separator />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconReceipt className="size-3.5" aria-hidden />
            <span className="text-xs tracking-wider uppercase">
              Operaciones del día
            </span>
          </div>
          <CardTitle>Detalle de operaciones</CardTitle>
          <CardDescription>
            Entregas y rechazos incluidos en este cierre
          </CardDescription>
        </CardHeader>
        <CardContent>
          {closing.operations.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
              <IconTruckDelivery
                className="size-5 text-muted-foreground"
                aria-hidden
              />
              <p className="text-sm text-muted-foreground">
                No se registraron operaciones en este día.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {closing.operations.map((row) => (
                  <OperationRow key={row.id} row={row} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <footer className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
        <span>
          Cierre generado el {formatDateTime(closing.generatedAt)} hs
        </span>
        <span className="font-mono uppercase">
          ID: {closing.id.slice(0, 8)}
        </span>
      </footer>
    </div>
  )
}

type OperationRowProps = {
  row: ClosingOperation
}

function OperationRow({ row }: OperationRowProps) {
  return (
    <TableRow>
      <TableCell className="text-muted-foreground tabular-nums">
        <div className="flex items-center gap-1.5">
          <IconClock className="size-3 shrink-0" aria-hidden />
          {row.time}
        </div>
      </TableCell>
      <TableCell>
        <span className="font-medium">{row.clientName}</span>
      </TableCell>
      <TableCell className="text-muted-foreground">{row.description}</TableCell>
      <TableCell>
        <Badge variant="outline">{row.methodLabel}</Badge>
      </TableCell>
      <TableCell className="text-right font-medium tabular-nums">
        {formatCurrency(row.amount)}
      </TableCell>
      <TableCell>
        <StatusBadge status={row.status} label={row.statusLabel} />
      </TableCell>
    </TableRow>
  )
}

type StatusBadgeProps = {
  status: "entregado" | "rechazado"
  label: string
}

function StatusBadge({ status, label }: StatusBadgeProps) {
  if (status === "entregado") {
    return (
      <Badge variant="outline">
        <IconCheck data-icon="inline-start" />
        {label}
      </Badge>
    )
  }
  return (
    <Badge variant="destructive">
      <IconCircleX data-icon="inline-start" />
      {label}
    </Badge>
  )
}
