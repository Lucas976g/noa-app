import { create } from "zustand"

import type { CategoryId, Product } from "./model"
import { fetchProducts } from "./api"

type ProductsState = {
  products: Product[]
  loading: boolean
  error: string | null
  load: () => Promise<void>
}

export const useProductsStore = create<ProductsState>()((set) => ({
  products: [],
  loading: false,
  error: null,
  load: async () => {
    set({ loading: true, error: null })
    try {
      const products = await fetchProducts()
      set({ products, loading: false })
    } catch {
      set({ error: "No pudimos cargar los productos.", loading: false })
    }
  },
}))

export const selectByCategory = (
  products: ReadonlyArray<Product>,
  category: CategoryId | "all"
): Product[] =>
  category === "all"
    ? [...products]
    : products.filter((p) => p.category === category)
