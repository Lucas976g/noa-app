import { useEffect, useState } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { fetchOrderById } from "@/orders/api"
import type { Order } from "@/orders/model"
import { formatCurrency, formatDateTime } from "@/shared/lib/format"
import { getOrderStatus } from "@/orders/model"
import { PAYMENT_METHODS } from "@/orders/model"

type ProcessOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  onApprove: () => Promise<void> | void
  onCancel: (reason: string, observations?: string) => Promise<void> | void
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
  const [observations, setObservations] = useState("")
  const [details, setDetails] = useState<Order>(order)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !order?.id) return
    setDetails(order)
    setMode("default")
    setReason("")
    setObservations("")
    setSubmitting(false)
    let active = true
    setLoadingDetails(true)
    void fetchOrderById(order.id)
      .then((fullOrder) => {
        if (active) setDetails(fullOrder)
      })
      .catch((err) => {
        console.warn("Error al cargar detalles del pedido:", err)
      })
      .finally(() => {
        if (active) setLoadingDetails(false)
      })

    return () => {
      active = false
    }
  }, [open, order])

  const status = getOrderStatus(details.status)
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === details.paymentMethod)?.label ??
    details.paymentMethod
  const shortId = details.id.slice(0, 8).toUpperCase()
  const trimmedReason = reason.trim()
  const trimmedObservations = observations.trim()
  const canConfirmCancel = trimmedReason.length > 0

  const handleApproveClick = async () => {
    if (submitting) return
    setSubmitting(true)
    try {
      await onApprove()
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelClick = async () => {
    if (submitting || !canConfirmCancel) return
    setSubmitting(true)
    try {
      await onCancel(trimmedReason, trimmedObservations)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={submitting ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex flex-col gap-1.5">
            <DialogTitle>Procesar pedido #{shortId}</DialogTitle>
            <DialogDescription>
              <span className="text-foreground">{details.userName}</span>
              {" · "}
              {formatDateTime(details.createdAt)}
            </DialogDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Badge variant={status.tone}>{status.label}</Badge>
            <Badge variant="outline">{paymentLabel}</Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div className="flex flex-col">
          <div className="flex items-center justify-between px-1 pb-3 text-muted-foreground">
            <div className="flex items-center gap-2">
              <IconReceipt className="size-3.5" aria-hidden />
              <span className="text-xs tracking-wider uppercase">
                {details.items.length}{" "}
                {details.items.length === 1 ? "producto" : "productos"}
              </span>
            </div>
            {loadingDetails ? (
              <Spinner className="size-3.5 text-muted-foreground" />
            ) : null}
          </div>

          {loadingDetails && details.items.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Spinner className="size-5 text-muted-foreground" />
            </div>
          ) : details.items.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
              Sin productos detallados para este pedido.
            </div>
          ) : (
            <ul className="flex max-h-60 flex-col divide-y divide-border overflow-y-auto rounded-lg border border-border">
              {details.items.map((item) => {
                const lineTotal = item.price * item.quantity
                return (
                  <li
                    key={item.productId || item.name}
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
          )}

          <div className="flex items-center justify-between px-1 pt-4">
            <span className="text-sm text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(details.subtotal)}
            </span>
          </div>
        </div>

        {mode === "cancel" ? (
          <>
            <Separator />
            <div className="flex flex-col gap-4">
              <Field>
                <FieldLabel htmlFor="cancel-reason">
                  Motivo de cancelación <span className="text-destructive">*</span>
                </FieldLabel>
                <Textarea
                  id="cancel-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ej: Falta de Stock, error en la carga del pedido, dirección incorrecta, etc."
                  rows={2}
                  disabled={submitting}
                  autoFocus
                />
                <FieldDescription>
                  Le avisaremos al cliente el motivo.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="cancel-observations">
                  Observaciones adicionales (opcional)
                </FieldLabel>
                <Textarea
                  id="cancel-observations"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Ej: El cliente indicó que volverá a cargar el pedido la próxima semana, verificar saldo pendiente, etc."
                  rows={2}
                  disabled={submitting}
                />
              </Field>
            </div>
          </>
        ) : null}

        <DialogFooter>
          {mode === "default" ? (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => setMode("cancel")}
              >
                Cancelar pedido
              </Button>
              <Button
                type="button"
                disabled={submitting || loadingDetails}
                onClick={() => void handleApproveClick()}
              >
                {submitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Aprobando…
                  </>
                ) : (
                  "Aprobar pedido"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                disabled={submitting}
                onClick={() => {
                  setMode("default")
                  setReason("")
                  setObservations("")
                }}
              >
                Volver
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={!canConfirmCancel || submitting}
                onClick={() => void handleCancelClick()}
              >
                {submitting ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Cancelando…
                  </>
                ) : (
                  "Confirmar cancelación"
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
