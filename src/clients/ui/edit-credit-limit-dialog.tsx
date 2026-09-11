import { useState } from "react"
import { IconWallet } from "@tabler/icons-react"

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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { Account } from "@/clients/model"
import { formatCurrency } from "@/shared/lib/format"

type EditCreditLimitDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientName: string
  account: Account
  onConfirm: (newLimit: number) => void
}

export function EditCreditLimitDialog({
  open,
  onOpenChange,
  clientName,
  account,
  onConfirm,
}: EditCreditLimitDialogProps) {
  const [limitText, setLimitText] = useState<string>(
    account.creditLimit.toString()
  )

  const newLimit = Number.parseFloat(limitText)
  const hasValidLimit = !Number.isNaN(newLimit) && newLimit >= 0
  const hasChanged = hasValidLimit && newLimit !== account.creditLimit
  const afterBalance = hasValidLimit
    ? newLimit - account.currentDebt
    : account.availableBalance
  const canConfirm = hasValidLimit && hasChanged

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm(newLimit)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setLimitText(account.creditLimit.toString())
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-hidden
            >
              <IconWallet className="size-4" />
            </div>
            <DialogTitle>Editar límite de crédito</DialogTitle>
          </div>
          <DialogDescription>
            Modificá el límite de crédito de{" "}
            <span className="font-medium text-foreground">«{clientName}»</span>.
            El saldo disponible se recalcula automáticamente.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel htmlFor="new-credit-limit">Nuevo límite</FieldLabel>
          <Input
            id="new-credit-limit"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.01}
            value={limitText}
            onChange={(e) => setLimitText(e.target.value)}
            autoFocus
          />
          {hasValidLimit && newLimit < account.currentDebt ? (
            <FieldDescription>
              El nuevo límite es menor a la deuda actual (
              {formatCurrency(account.currentDebt)}). El saldo disponible
              quedará en {formatCurrency(afterBalance)}.
            </FieldDescription>
          ) : null}
        </Field>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Límite actual</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(account.creditLimit)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Límite nuevo</span>
            <span className="font-medium tabular-nums">
              {hasValidLimit ? formatCurrency(newLimit) : "—"}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant="secondary">
              Saldo después:{" "}
              {hasValidLimit ? formatCurrency(afterBalance) : "—"}
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
