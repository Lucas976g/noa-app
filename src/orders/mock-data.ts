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
    deliveryAddress: "Av. Fascio 1230, San Salvador de Jujuy",
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
    deliveryAddress: "Belgrano 500, Palpalá, Jujuy",
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
  {
    id: "ord-mock-012",
    userId: "user-client-3",
    userName: "Kiosco Las Heras",
    status: "en-proceso",
    paymentMethod: "contado",
    subtotal: 71800,
    createdAt: new Date().toISOString(),
    deliveryAddress: "Av. Las Heras 412, Salta Capital",
    items: [
      {
        productId: "prod-3",
        name: "Bebida Energizante",
        price: 3590,
        unit: "unidad",
        quantity: 20,
      },
    ],
  },
  {
    id: "ord-mock-013",
    userId: "user-client-4",
    userName: "Restaurant La Tradición",
    status: "en-proceso",
    paymentMethod: "cuenta-corriente",
    subtotal: 65200,
    createdAt: new Date().toISOString(),
    deliveryAddress: "Calle Mitre 1180, San Miguel de Tucumán",
    items: [
      {
        productId: "prod-4",
        name: "Aceite de Oliva 1L",
        price: 8150,
        unit: "unidad",
        quantity: 8,
      },
    ],
  },
  {
    id: "ord-mock-014",
    userId: "user-client-5",
    userName: "Dietética Vida Sana",
    status: "entregado",
    paymentMethod: "contado",
    subtotal: 21000,
    createdAt: new Date().toISOString(),
    deliveryAddress: "Calle Urquiza 540, Salta Capital",
    items: [
      {
        productId: "prod-5",
        name: "Frutos Secos 500g",
        price: 4200,
        unit: "unidad",
        quantity: 5,
      },
    ],
  },
]
