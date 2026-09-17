import type { Order } from "./model"

export const mockOrders: Order[] = [
  {
    id: "ord-mock-001",
    userId: "user-client-1",
    userName: "Distribuidora del Norte",
    status: "en-analisis",
    paymentMethod: "cuenta-corriente",
    subtotal: 45500,
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: "prod-1",
        name: "Producto de Prueba A",
        price: 4550,
        unit: "unidad",
        quantity: 10,
      },
    ],
  },
  {
    id: "ord-mock-002",
    userId: "user-client-2",
    userName: "Comercial Jujuy",
    status: "en-analisis",
    paymentMethod: "contado",
    subtotal: 128000,
    createdAt: new Date().toISOString(),
    items: [
      {
        productId: "prod-2",
        name: "Producto de Prueba B",
        price: 6400,
        unit: "unidad",
        quantity: 20,
      },
    ],
  },
]