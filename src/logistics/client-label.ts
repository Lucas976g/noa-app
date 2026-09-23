import type { Order } from "@/orders/model"

// El backend no envía el nombre del cliente: se muestra su id corto.
export const clientLabel = (order: Order): string =>
  order.userName || `Cliente #${order.userId.slice(0, 8).toUpperCase()}`
