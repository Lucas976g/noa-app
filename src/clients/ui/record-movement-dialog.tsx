import { useState } from "react"
import {
  IconArrowDown,
  IconArrowUp,
  IconCash,
  type Icon,
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { Account } from "@/clients/model"
import { formatCurrency } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

export type MovementType = "nueva-deuda" | "pago-recibido"

type MovementOption = {
  id: MovementType
  label: string
  description: string
  icon: Icon
}

const MOVEMENT_OPTIONS: ReadonlyArray<MovementOption> = [
  {
    id: "nueva-deuda",
    label: "Nueva deuda",
    description:
      "Suma al saldo pendiente del cliente. El saldo disponible se reduce.",
    icon: IconArrowUp,
  },
  {
    id: "pago-recibido",
    label: "Pago recibido",
    description:
      "Resta al saldo pendiente del cliente. El saldo disponible aumenta.",
    icon: IconArrowDown,
  },
]

type RecordMovementDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientName: string
  account: Account
  onConfirm: (input: { type: MovementType; amount: number }) => void
}

export function RecordMovementDialog({
  open,
  onOpenChange,
  clientName,
  account,
  onConfirm,
}: RecordMovementDialogProps) {
  const [type, setType] = useState<MovementType>("nueva-deuda")
  const [amountText, setAmountText] = useState("")

  const amount = Number.parseFloat(amountText)
  const hasValidAmount = !Number.isNaN(amount) && amount > 0
  const isPayment = type === "pago-recibido"
  const exceedsDebt = isPayment && amount > account.currentDebt
  const amountError = exceedsDebt
    ? `El pago no puede superar la deuda actual de ${formatCurrency(account.currentDebt)}.`
    : null

  const canConfirm = hasValidAmount && !exceedsDebt

  const afterDebt = hasValidAmount
    ? isPayment
      ? Math.max(0, account.currentDebt - amount)
      : account.currentDebt + amount
    : account.currentDebt
  const afterBalance = hasValidAmount
    ? isPayment
      ? Math.min(account.creditLimit, account.availableBalance + amount)
      : Math.max(
          account.creditLimit - account.currentDebt - amount,
          account.availableBalance - amount
        )
    : account.availableBalance

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({ type, amount })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setType("nueva-deuda")
      setAmountText("")
    }
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
              <IconCash className="size-4" />
            </div>
            <DialogTitle>Registrar movimiento</DialogTitle>
          </div>
          <DialogDescription>
            Sumá una nueva deuda o registrá un pago recibido de{" "}
            <span className="font-medium text-foreground">«{clientName}»</span>.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Tipo de movimiento</FieldLabel>
          <RadioGroup
            value={type}
            onValueChange={(value) => setType(value as MovementType)}
            className="gap-2"
          >
            {MOVEMENT_OPTIONS.map((opt) => {
              const Icon = opt.icon
              const id = `movement-${opt.id}`
              return (
                <label
                  key={opt.id}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                    type === opt.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem id={id} value={opt.id} />
                  <Icon
                    className="mt-0.5 size-4 text-muted-foreground"
                    aria-hidden
                  />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {opt.description}
                    </span>
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        </Field>

        <Field>
          <FieldLabel htmlFor="movement-amount">Monto</FieldLabel>
          <Input
            id="movement-amount"
            type="number"
            inputMode="decimal"
            min={0.01}
            step={0.01}
            value={amountText}
            onChange={(e) => setAmountText(e.target.value)}
            placeholder="0,00"
            autoFocus
            aria-invalid={amountError !== null}
          />
          {amountError ? <FieldError>{amountError}</FieldError> : null}
        </Field>

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <Badge variant="secondary">
            Deuda después: {formatCurrency(afterDebt)}
          </Badge>
          <Badge variant="secondary">
            Saldo después: {formatCurrency(afterBalance)}
          </Badge>
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
            Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
