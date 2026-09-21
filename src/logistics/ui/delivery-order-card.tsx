import { IconMapPin, IconUser } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { clientLabel } from "@/logistics/client-label"
import { PAYMENT_METHODS, type Order } from "@/orders/model"
import { formatCurrency } from "@/shared/lib/format"

type DeliveryOrderCardProps = {
  order: Order
  onRegisterDelivery: (order: Order) => void
  onCancel: (order: Order) => void
}

export function DeliveryOrderCard({
  order,
  onRegisterDelivery,
  onCancel,
}: DeliveryOrderCardProps) {
  const shortId = order.id.slice(0, 8).toUpperCase()
  const paymentLabel =
    PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label ??
    order.paymentMethod

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base font-semibold tabular-nums">
              Pedido #{shortId}
            </span>
            <Badge variant="outline" className="font-normal">
              {paymentLabel}
            </Badge>
          </div>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <IconUser className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate text-foreground">
                {clientLabel(order)}
              </span>
            </span>
            <span className="flex items-center gap-2">
              <IconMapPin className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">
                {order.deliveryAddress ?? "Dirección no disponible"}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 sm:justify-end">
          <div className="flex flex-col sm:items-end">
            <span className="text-xs text-muted-foreground">Subtotal</span>
            <span className="text-lg font-semibold tabular-nums">
              {formatCurrency(order.subtotal)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCancel(order)}
              aria-label={`Cancelar pedido ${shortId}`}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => onRegisterDelivery(order)}
              aria-label={`Registrar entrega del pedido ${shortId}`}
            >
              Registrar entrega
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
