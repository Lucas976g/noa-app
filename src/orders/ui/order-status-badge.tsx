import {
  IconCircleCheck,
  IconCircleX,
  IconClockSearch,
  IconPackage,
  type Icon,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { getOrderStatus, type OrderStatusId } from "@/orders/model"

const ORDER_STATUS_ICONS: Readonly<Record<OrderStatusId, Icon>> = {
  "en-analisis": IconClockSearch,
  "en-proceso": IconPackage,
  entregado: IconCircleCheck,
  cancelado: IconCircleX,
}

type OrderStatusBadgeProps = {
  status: OrderStatusId
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = getOrderStatus(status)
  const StatusIcon = ORDER_STATUS_ICONS[status]

  return (
    <Badge variant={config.tone}>
      <StatusIcon data-icon="inline-start" aria-hidden />
      {config.label}
    </Badge>
  )
}
