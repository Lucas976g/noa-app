import type { Icon } from "@tabler/icons-react"

export type CategoryId = "fiambres" | "lacteos" | "secos" | "bebidas"

export type Category = {
  id: CategoryId
  label: string
  icon: Icon
}

export type Product = {
  id: string
  name: string
  category: CategoryId
  price: number
  unit: string
}

export type ProductForm = Omit<Product, "id">

export type CartItem = {
  productId: string
  name: string
  price: number
  unit: string
  quantity: number
}

export const CATEGORY_MAP: Readonly<Record<string, CategoryId>> = {
  fiambres: "fiambres",
  fiambre: "fiambres",
  embutidos: "fiambres",
  lácteos: "lacteos",
  lacteos: "lacteos",
  lácteo: "lacteos",
  lacteo: "lacteos",
  secos: "secos",
  seco: "secos",
  bebidas: "bebidas",
  bebida: "bebidas",
}
