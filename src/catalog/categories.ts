import { IconBottle, IconBox, IconMeat, IconMilk } from "@tabler/icons-react"

import type { CategoryId, Category } from "./model"

export const CATEGORIES: ReadonlyArray<Category> = [
  { id: "fiambres", label: "Fiambres", icon: IconMeat },
  { id: "lacteos", label: "Lácteos", icon: IconMilk },
  { id: "secos", label: "Secos", icon: IconBox },
  { id: "bebidas", label: "Bebidas", icon: IconBottle },
]

export const getCategory = (id: CategoryId): Category => {
  const found = CATEGORIES.find((c) => c.id === id)
  if (!found) {
    throw new Error(`Unknown category: ${id}`)
  }
  return found
}
