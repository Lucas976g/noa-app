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
import type { Order } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"

type CancelOrderDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
  isSubmitting: boolean
  onConfirm: () => void
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  order,
  isSubmitting,
  onConfirm,
}: CancelOrderDialogProps) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const isAccountOrder = order.paymentMethod === "cuenta-corriente"

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (isSubmitting) return
        onOpenChange(next)
      }}
    >
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
            Vas a cancelar tu pedido de {formatCurrency(order.subtotal)}. Esta
            acción no se puede deshacer.
            {isAccountOrder
              ? " El importe se devolverá a tu saldo de cuenta corriente."
              : null}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={onConfirm}
          >
            {isSubmitting ? "Cancelando..." : "Cancelar pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
