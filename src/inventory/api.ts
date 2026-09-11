import type { InventoryItem } from "./model"

// GET /inventory — listar items de inventario
export const fetchInventory = async (): Promise<InventoryItem[]> => {
  // TODO: implementar
  // return apiFetch<InventoryItem[]>("/inventory")
  throw new Error("Not implemented: GET /inventory")
}

// PATCH /inventory/:id — actualizar stock/precios
export const updateInventoryItem = async (): Promise<InventoryItem> => {
  // TODO: implementar
  // return apiFetch<InventoryItem>(`/inventory/${id}`, { method: "PATCH", body: JSON.stringify(data) })
  throw new Error("Not implemented: PATCH /inventory/:id")
}
