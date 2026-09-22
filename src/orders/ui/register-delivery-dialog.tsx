import { useState } from "react"
import {
  IconExclamationCircle,
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
import { Field, FieldLabel } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import type { CartItem } from "@/catalog/model"
import { DELIVERY_PAYMENT_METHODS } from "@/logistics/model"
import { formatCurrency } from "@/shared/lib/format"
import {
  PAYMENT_METHODS,
  type ContadoCollectionMethod,
  type PaymentMethod,
} from "@/orders/model"
import { cn } from "@/shared/lib/utils"

// El backend imputa el pedido de contado exactamente por su total: no admite
// cobro parcial. La cuenta corriente no elige método, se imputa sola.
const CONTADO_METHODS = DELIVERY_PAYMENT_METHODS.filter(
  (
    m
  ): m is (typeof DELIVERY_PAYMENT_METHODS)[number] & {
    id: ContadoCollectionMethod
  } => m.id === "efectivo" || m.id === "transferencia"
)

type RegisterDeliveryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortId: string
  clientName: string
  deliveryAddress?: string
  subtotal: number
  orderPaymentMethod: PaymentMethod
  items: CartItem[]
  // El listado no trae items: se piden al abrir el registro de entrega.
  isLoadingItems?: boolean
  itemsError?: string | null
  onRetryItems?: () => void
  onConfirm: (input: {
    paymentMethod?: ContadoCollectionMethod
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
  orderPaymentMethod,
  items,
  isLoadingItems = false,
  itemsError = null,
  onRetryItems,
  onConfirm,
  isSubmitting = false,
  error = null,
}: RegisterDeliveryDialogProps) {
  const isCtaCteOrder = orderPaymentMethod === "cuenta-corriente"
  const [paymentMethod, setPaymentMethod] =
    useState<ContadoCollectionMethod>("efectivo")
  const [observations, setObservations] = useState("")

  const canConfirm = !isSubmitting

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({
      paymentMethod: isCtaCteOrder ? undefined : paymentMethod,
      observations: observations.trim() || undefined,
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return
    if (!next) {
      setPaymentMethod("efectivo")
      setObservations("")
    }
    onOpenChange(next)
  }

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
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <IconWallet className="size-3.5" aria-hidden />
              <span className="text-xs tracking-wider uppercase">
                Medio de pago del pedido
              </span>
            </div>
            <Badge variant="outline">
              {PAYMENT_METHODS.find((m) => m.id === orderPaymentMethod)
                ?.label ?? orderPaymentMethod}
            </Badge>
          </div>
          {deliveryAddress ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IconMapPin className="size-3.5" aria-hidden />
              <span className="truncate">{deliveryAddress}</span>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IconReceipt className="size-3.5" aria-hidden />
            <span className="text-xs tracking-wider uppercase">
              {items.length === 0
                ? "Productos"
                : `${items.length} ${items.length === 1 ? "producto" : "productos"}`}
            </span>
          </div>

          {items.length > 0 ? (
            <ul className="flex max-h-48 flex-col divide-y divide-border overflow-y-auto rounded-lg border border-border">
              {items.map((item) => {
                const lineTotal = item.price * item.quantity
                return (
                  <li
                    key={item.productId}
                    className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {item.quantity}{" "}
                        {item.quantity === 1 ? "unidad" : "unidades"} ·{" "}
                        {formatCurrency(item.price)} {item.unit}
                      </span>
                    </div>
                    <span className="self-center text-right font-medium tabular-nums">
                      {formatCurrency(lineTotal)}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : isLoadingItems ? (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              Cargando el detalle de productos...
            </div>
          ) : itemsError ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <IconExclamationCircle
                  className="size-3.5 shrink-0"
                  aria-hidden
                />
                {itemsError}
              </span>
              {onRetryItems ? (
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={onRetryItems}
                >
                  Reintentar
                </Button>
              ) : null}
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              El detalle de productos de este pedido no está disponible.
            </div>
          )}
        </div>

        {isCtaCteOrder ? (
          <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
            Se imputa el total a la cuenta corriente del cliente. No se cobra
            nada en el momento.
          </p>
        ) : (
          <Field>
            <FieldLabel>Forma de cobro</FieldLabel>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as ContadoCollectionMethod)
              }
              className="gap-2"
            >
              {CONTADO_METHODS.map((method) => {
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
                      <span className="text-sm font-medium">
                        {method.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {method.description}
                      </span>
                    </div>
                  </label>
                )
              })}
            </RadioGroup>
          </Field>
        )}

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
