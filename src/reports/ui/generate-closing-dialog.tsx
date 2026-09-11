import { IconAlertTriangle, IconCashRegister } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/shared/lib/format"
import type { ClosingComputation } from "@/reports/lib"

type GenerateClosingDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  date: Date
  preview: ClosingComputation
  onConfirm: () => void
}

export function GenerateClosingDialog({
  open,
  onOpenChange,
  date,
  preview,
  onConfirm,
}: GenerateClosingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary"
              aria-hidden
            >
              <IconCashRegister className="size-4" />
            </div>
            <DialogTitle>Generar cierre de caja</DialogTitle>
          </div>
          <DialogDescription>
            Vas a generar el cierre de caja del{" "}
            <span className="font-medium text-foreground">
              {formatDate(date.toISOString())}
            </span>
            . Una vez generado no podrá modificarse.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3 text-sm">
          <IconAlertTriangle
            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span className="text-muted-foreground">
            Revisá los totales antes de confirmar. El cierre se registrará con
            la fecha y hora actuales.
          </span>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2">
          <PreviewItem
            label="Total recaudado"
            value={formatCurrency(preview.totalCollected)}
          />
          <PreviewItem
            label="Saldo final caja"
            value={formatCurrency(preview.balanceAfter)}
          />
          <PreviewItem
            label="Entregas exitosas"
            value={preview.deliveredCount.toString()}
          />
          <PreviewItem
            label="Pedidos rechazados"
            value={preview.rejectedCount.toString()}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <Badge variant="secondary">
            Efectivo: {formatCurrency(preview.paymentMethods.efectivo.amount)}
          </Badge>
          <Badge variant="secondary">
            Transferencia:{" "}
            {formatCurrency(preview.paymentMethods.transferencia.amount)}
          </Badge>
          <Badge variant="secondary">
            Cta. cte.:{" "}
            {formatCurrency(
              preview.paymentMethods["imputacion-cta-cte"].amount
            )}
          </Badge>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm}>
            Confirmar y generar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type PreviewItemProps = {
  label: string
  value: string
}

function PreviewItem({ label, value }: PreviewItemProps) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border bg-card p-3">
      <span className="text-xs tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-base font-semibold tabular-nums">{value}</span>
    </div>
  )
}
