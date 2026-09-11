import {
  IconAlertCircle,
  IconBuildingStore,
  IconCheck,
  IconMail,
  IconMapPin,
  IconWallet,
} from "@tabler/icons-react"

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
import type { Account } from "@/clients/model"
import { formatCurrency } from "@/shared/lib/format"
import { getInitials } from "@/shared/lib/initials"
import { cn } from "@/shared/lib/utils"

type ClientDetailDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientName: string
  clientEmail: string
  account: Account
  onEditCreditLimit: () => void
  onRecordMovement: () => void
}

export function ClientDetailDialog({
  open,
  onOpenChange,
  clientName,
  clientEmail,
  account,
  onEditCreditLimit,
  onRecordMovement,
}: ClientDetailDialogProps) {
  const hasDebt = account.currentDebt > 0
  const usedPercentage =
    account.creditLimit > 0
      ? Math.min(
          100,
          Math.max(0, (account.currentDebt / account.creditLimit) * 100)
        )
      : 0
  const isOverUsed = usedPercentage >= 80
  const initials = getInitials(clientName)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-base font-medium text-primary"
              aria-hidden
            >
              {initials}
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <DialogTitle>{clientName}</DialogTitle>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <IconMail className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{clientEmail}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <Badge variant="secondary" className="gap-1.5 font-normal">
                  <IconBuildingStore className="size-3" aria-hidden />
                  Cliente
                </Badge>
                {hasDebt ? (
                  <Badge variant="secondary">
                    <IconAlertCircle data-icon="inline-start" />
                    Con deuda
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <IconCheck data-icon="inline-start" />
                    Al día
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconWallet className="size-3.5" aria-hidden />
            <span className="text-xs tracking-wider uppercase">
              Cuenta corriente
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Stat label="Límite" value={formatCurrency(account.creditLimit)} />
            <Stat
              label="Deuda"
              value={formatCurrency(account.currentDebt)}
              tone={hasDebt ? "destructive" : "muted"}
            />
            <Stat
              label="Saldo"
              value={formatCurrency(account.availableBalance)}
              tone="primary"
            />
          </div>

          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round(usedPercentage)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Crédito utilizado"
          >
            <div
              className={cn(
                "h-full transition-all",
                isOverUsed ? "bg-destructive" : "bg-primary"
              )}
              style={{ width: `${usedPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uso: {Math.round(usedPercentage)}%</span>
            {isOverUsed ? (
              <span className="font-medium text-destructive">
                Cerca del límite
              </span>
            ) : null}
          </div>
        </div>

        <DialogDescription asChild>
          <div className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
            <IconMapPin
              className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="text-foreground">{account.defaultAddress}</span>
          </div>
        </DialogDescription>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
          <Button type="button" variant="outline" onClick={onEditCreditLimit}>
            <IconWallet data-icon="inline-start" />
            Editar límite de crédito
          </Button>
          <Button type="button" onClick={onRecordMovement}>
            <IconCheck data-icon="inline-start" />
            Registrar movimiento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type StatProps = {
  label: string
  value: string
  tone?: "primary" | "destructive" | "muted"
}

function Stat({ label, value, tone = "muted" }: StatProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-base font-semibold tabular-nums",
          tone === "primary" && "text-foreground",
          tone === "destructive" && "text-destructive",
          tone === "muted" && "text-foreground"
        )}
      >
        {value}
      </span>
    </div>
  )
}
