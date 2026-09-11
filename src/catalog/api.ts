import { apiFetch } from "@/shared/http/client"
import type { CategoryId, Product } from "./model"
import { CATEGORY_MAP } from "./model"

type ApiProduct = {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  subcategoria: string
  unidadMedida: string
  precioVenta: string
  activo: boolean
  createdAt: string
}

const mapCategory = (raw: string): CategoryId => {
  const normalized = raw.trim().toLowerCase()
  return CATEGORY_MAP[normalized] ?? "secos"
}

const mapUnit = (unidadMedida: string, nombre: string): string => {
  const unit = unidadMedida.toLowerCase().trim()
  const match = nombre.match(/(\d+(?:\.\d+)?)\s*(ml|l|g|kg)/i)
  const qty = match?.[0] ?? ""
  if (unit === "litro" || unit === "litros") return qty || "x 1L"
  if (unit === "kilogramo" || unit === "kilogramos" || unit === "kg")
    return qty || "x 1kg"
  if (unit === "unidad" || unit === "unidades") return qty || "x 1u"
  return qty || unit
}

export const fetchProducts = async (): Promise<Product[]> => {
  const products = await apiFetch<ApiProduct[]>("/products")
  return products
    .filter((p) => p.activo)
    .map((p) => ({
      id: p.id,
      name: p.nombre,
      category: mapCategory(p.categoria),
      price: Number.parseFloat(p.precioVenta),
      unit: mapUnit(p.unidadMedida, p.nombre),
    }))
}
