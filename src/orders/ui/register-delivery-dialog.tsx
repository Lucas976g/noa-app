import { useState } from "react"
import {
  IconBuildingWarehouse,
  IconMapPin,
  IconReceipt,
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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  DELIVERY_PAYMENT_METHODS,
  type DeliveryPaymentMethod,
} from "@/logistics/model"
import { formatCurrency } from "@/shared/lib/format"
import { PAYMENT_METHODS, type PaymentMethod } from "@/orders/model"
import { cn } from "@/shared/lib/utils"

type RegisterDeliveryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortId: string
  clientName: string
  deliveryAddress?: string
  subtotal: number
  // Sin dato (el backend no lo expone a logística) se oculta el saldo.
  availableBalance?: number
  orderPaymentMethod: PaymentMethod
  onConfirm: (input: {
    paymentMethod: DeliveryPaymentMethod
    receivedAmount: number
    debtAmount: number
    observations?: string
  }) => void
  isSubmitting?: boolean
  error?: string | null
}

export function RegisterDeliveryDialog({
  open,
  onOpenChange,
  shortId,
  clientName,
  deliveryAddress,
  subtotal,
  availableBalance,
  orderPaymentMethod,
  onConfirm,
  isSubmitting = false,
  error = null,
}: RegisterDeliveryDialogProps) {
  const isCtaCteOrder = orderPaymentMethod === "cuenta-corriente"
  const [paymentMethod, setPaymentMethod] =
    useState<DeliveryPaymentMethod>("efectivo")
  const [receivedAmountText, setReceivedAmountText] = useState<string>(
    subtotal.toString()
  )
  const [observations, setObservations] = useState("")

  const isCtaCteImputation = paymentMethod === "imputacion-cta-cte"
  const receivedAmount = Number.parseFloat(receivedAmountText)
  const hasValidReceivedAmount =
    !Number.isNaN(receivedAmount) &&
    receivedAmount >= 0 &&
    receivedAmount <= subtotal
  const isInputLocked = isCtaCteImputation || !isCtaCteOrder
  const debtAmount = hasValidReceivedAmount
    ? Math.max(0, subtotal - receivedAmount)
    : 0
  const hasDebt = debtAmount > 0
  const afterBalance =
    availableBalance === undefined
      ? undefined
      : hasValidReceivedAmount
        ? availableBalance + receivedAmount
        : availableBalance
  const canConfirm = hasValidReceivedAmount && !isSubmitting

  const handlePaymentMethodChange = (next: DeliveryPaymentMethod) => {
    setPaymentMethod(next)
    if (next === "imputacion-cta-cte") {
      setReceivedAmountText("0")
    } else {
      setReceivedAmountText(subtotal.toString())
    }
  }

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({
      paymentMethod,
      receivedAmount,
      debtAmount,
      observations: observations.trim() || undefined,
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return
    if (!next) {
      setPaymentMethod("efectivo")
      setReceivedAmountText(subtotal.toString())
      setObservations("")
    }
    onOpenChange(next)
  }

  const availableMethods = isCtaCteOrder
    ? DELIVERY_PAYMENT_METHODS
    : DELIVERY_PAYMENT_METHODS.filter((m) => m.id !== "imputacion-cta-cte")

  const receivedAmountDescription = isCtaCteImputation
    ? "Imputación total a la cuenta corriente. No se cobra nada al cliente."
    : "Lo que cobraste al momento. El resto se imputa a la cuenta corriente del cliente."

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar entrega #{shortId}</DialogTitle>
          <DialogDescription>
            <span className="text-foreground">{clientName}</span>
            {deliveryAddress ? (
              <span className="text-muted-foreground">
                {" · "}
                {deliveryAddress}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconReceipt className="size-3.5" aria-hidden />
              <span className="text-xs tracking-wider uppercase">Total</span>
            </div>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(subtotal)}
            </span>
          </div>
          {availableBalance !== undefined ? (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconBuildingWarehouse className="size-3.5" aria-hidden />
                <span className="text-xs tracking-wider uppercase">
                  Saldo disponible
                </span>
              </div>
              <span className="font-medium tabular-nums">
                {formatCurrency(availableBalance)}
              </span>
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconWallet className="size-3.5" aria-hidden />
              <span className="text-xs tracking-wider uppercase">
                Medio de pago del pedido
              </span>
            </div>
            <Badge variant="outline">
              {PAYMENT_METHODS.find((m) => m.id === orderPaymentMethod)?.label ??
                orderPaymentMethod}
            </Badge>
          </div>
          {deliveryAddress ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconMapPin className="size-3.5" aria-hidden />
              <span className="truncate">{deliveryAddress}</span>
            </div>
          ) : null}
        </div>

        <Field>
          <FieldLabel>Forma de cobro</FieldLabel>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) =>
              handlePaymentMethodChange(value as DeliveryPaymentMethod)
            }
            className="gap-2"
          >
            {availableMethods.map((method) => {
              const id = `dpm-${method.id}`
              return (
                <label
                  key={method.id}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                    paymentMethod === method.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem id={id} value={method.id} />
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{method.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {method.description}
                    </span>
                  </div>
                </label>
              )
            })}
          </RadioGroup>
        </Field>

        <Field>
          <FieldLabel htmlFor="received-amount">Monto recibido</FieldLabel>
          <Input
            id="received-amount"
            type="number"
            inputMode="decimal"
            min={0}
            max={subtotal}
            step={0.01}
            value={receivedAmountText}
            onChange={(e) => setReceivedAmountText(e.target.value)}
            disabled={isInputLocked}
          />
          {isCtaCteOrder ? (
            <FieldDescription>{receivedAmountDescription}</FieldDescription>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
            <Badge variant={hasDebt ? "secondary" : "outline"}>
              Deuda a registrar: {formatCurrency(debtAmount)}
            </Badge>
            {isCtaCteOrder && afterBalance !== undefined ? (
              <Badge variant="secondary">
                Saldo después: {formatCurrency(afterBalance)}
              </Badge>
            ) : null}
          </div>
        </Field>

        <Field>
          <FieldLabel htmlFor="delivery-observations">Observaciones</FieldLabel>
          <Textarea
            id="delivery-observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Ej: Mercadería entregada en recepción, sin observaciones…"
            rows={3}
          />
        </Field>

        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
            {isSubmitting ? "Registrando..." : "Finalizar entrega"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
