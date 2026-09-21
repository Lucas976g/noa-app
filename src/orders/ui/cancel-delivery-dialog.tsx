import { useState } from "react"
import { IconAlertTriangle } from "@tabler/icons-react"

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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  DELIVERY_CANCEL_REASONS,
  type DeliveryCancelReason,
} from "@/logistics/model"
import { cn } from "@/shared/lib/utils"

type CancelDeliveryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  shortId: string
  clientName: string
  onConfirm: (input: {
    reason: DeliveryCancelReason
    observations: string
  }) => void
  isSubmitting?: boolean
  error?: string | null
}

export function CancelDeliveryDialog({
  open,
  onOpenChange,
  shortId,
  clientName,
  onConfirm,
  isSubmitting = false,
  error = null,
}: CancelDeliveryDialogProps) {
  const [reason, setReason] = useState<DeliveryCancelReason | "">("")
  const [observations, setObservations] = useState("")

  const trimmedObservations = observations.trim()
  const canConfirm = reason !== "" && !isSubmitting

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({ reason, observations: trimmedObservations })
  }

  const handleOpenChange = (next: boolean) => {
    if (isSubmitting) return
    if (!next) {
      setReason("")
      setObservations("")
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <IconAlertTriangle className="size-4" />
            </div>
            <DialogTitle>Cancelar pedido #{shortId}</DialogTitle>
          </div>
          <DialogDescription>
            Vas a cancelar el pedido de{" "}
            <span className="text-foreground">{clientName}</span>. Seleccioná el
            motivo y agregá observaciones si es necesario.
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>Motivo</FieldLabel>
          <RadioGroup
            value={reason}
            onValueChange={(value) => setReason(value as DeliveryCancelReason)}
            className="gap-2"
          >
            {DELIVERY_CANCEL_REASONS.map((opt) => {
              const id = `cancel-reason-${opt.id}`
              return (
                <label
                  key={opt.id}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                    reason === opt.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem id={id} value={opt.id} />
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
          <FieldLabel htmlFor="cancel-observations">Observaciones</FieldLabel>
          <Textarea
            id="cancel-observations"
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Detalle adicional sobre la cancelación…"
            rows={3}
          />
          <FieldDescription>
            Le avisaremos al cliente el motivo de la cancelación.
          </FieldDescription>
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
            Volver
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {isSubmitting ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
