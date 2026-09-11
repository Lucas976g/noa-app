import { useState } from "react"
import { IconReceipt } from "@tabler/icons-react"

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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import type { Order } from "@/orders/model"
import { formatCurrency, formatDateTime } from "@/shared/lib/format"
import { getOrderStatus } from "@/orders/model"
import { PAYMENT_METHODS } from "@/orders/model"

type ProcessOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onApprove: () => void
  onCancel: (reason: string) => void
}

type Mode = "default" | "cancel"

export function ProcessOrderDialog({
  open,
  onOpenChange,
  order,
  onApprove,
  onCancel,
}: ProcessOrderDialogProps) {
  const [mode, setMode] = useState<Mode>("default")
  const [reason, setReason] = useState("")

  const status = getOrderStatus(order.status)
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ??
    order.paymentMethod
  const shortId = order.id.slice(0, 8).toUpperCase()
  const trimmedReason = reason.trim()
  const canConfirmCancel = trimmedReason.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col gap-1.5">
            <DialogTitle>Procesar pedido #{shortId}</DialogTitle>
            <DialogDescription>
              <span className="text-foreground">{order.userName}</span>
              {" · "}
              {formatDateTime(order.createdAt)}
            </DialogDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant={status.tone}>{status.label}</Badge>
            <Badge variant="outline">{paymentLabel}</Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col">
          <div className="flex items-center gap-2 px-1 pb-3 text-muted-foreground">
            <IconReceipt className="size-3.5" aria-hidden />
            <span className="text-xs tracking-wider uppercase">
              {order.items.length}{" "}
              {order.items.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {order.items.map((item) => {
              const lineTotal = item.price * item.quantity
              return (
                <li
                  key={item.productId}
                  className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5 px-3 py-2.5 text-sm"
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

          <div className="flex items-center justify-between px-1 pt-4">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
        </div>

        {mode === "cancel" ? (
          <>
            <Separator />
            <Field>
              <FieldLabel htmlFor="cancel-reason">
                Motivo de cancelación
              </FieldLabel>
              <Textarea
                id="cancel-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Sin stock, dirección incorrecta, etc."
                rows={3}
                autoFocus
              />
              <FieldDescription>
                Le avisaremos al cliente el motivo.
              </FieldDescription>
            </Field>
          </>
        ) : null}

        <DialogFooter>
          {mode === "default" ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMode("cancel")}
              >
                Cancelar pedido
              </Button>
              <Button type="button" onClick={onApprove}>
                Aprobar pedido
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode("default")
                  setReason("")
                }}
              >
                Volver
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!canConfirmCancel}
                onClick={() => onCancel(trimmedReason)}
              >
                Confirmar cancelación
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
