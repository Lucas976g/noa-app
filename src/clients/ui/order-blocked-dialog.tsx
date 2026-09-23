import { IconShieldX } from "@tabler/icons-react"

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
import {
  BLOCK_REASON_TITLES,
  type Account,
  type AccountBlockReason,
} from "@/clients/model"
import { formatCurrency } from "@/shared/lib/format"

type OrderBlockedDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  reason: AccountBlockReason
  account: Account
  subtotal: number
  shortfall: number
}

export function OrderBlockedDialog({
  open,
  onOpenChange,
  reason,
  account,
  subtotal,
  shortfall,
}: OrderBlockedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <IconShieldX className="size-4" />
            </div>
            <DialogTitle>{BLOCK_REASON_TITLES[reason]}</DialogTitle>
          </div>
          <DialogDescription>
            Tu pedido de {formatCurrency(subtotal)} no puede procesarse.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <dl className="flex flex-col gap-1.5 text-sm">
          <Row
            label="Total del pedido"
            value={formatCurrency(subtotal)}
            emphasis
          />
          <Row
            label="Saldo disponible"
            value={formatCurrency(account.availableBalance)}
          />
          <Row
            label="Límite de crédito"
            value={formatCurrency(account.creditLimit)}
          />
          {shortfall > 0 ? (
            <Row label="Te faltan" value={formatCurrency(shortfall)} />
          ) : null}
        </dl>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type RowProps = {
  label: string
  value: string
  emphasis?: boolean
}

function Row({ label, value, emphasis }: RowProps) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={`tabular-nums ${emphasis ? "font-semibold" : "text-muted-foreground"}`}
      >
        {value}
      </dd>
    </div>
  )
}
