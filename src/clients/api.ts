import type { Account } from "./model"

// GET /clients — listar todos los clientes
export const fetchClients = async (): Promise<Account[]> => {
  // TODO: implementar
  // return apiFetch<Account[]>("/clients")
  throw new Error("Not implemented: GET /clients")
}

// PATCH /clients/:id — actualizar cliente (límite de crédito, bloqueo, etc.)
export const updateClient = async (): Promise<Account> => {
  // TODO: implementar
  // return apiFetch<Account>(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(data) })
  throw new Error("Not implemented: PATCH /clients/:id")
}

// POST /clients/:id/block — bloquear cliente
export const blockClient = async (): Promise<void> => {
  // TODO: implementar
  // await apiFetch(`/clients/${id}/block`, { method: "POST", body: JSON.stringify({ reason }) })
  throw new Error("Not implemented: POST /clients/:id/block")
}

// POST /clients/:id/unblock — desbloquear cliente
export const unblockClient = async (): Promise<void> => {
  // TODO: implementar
  // await apiFetch(`/clients/${id}/unblock`, { method: "POST" })
  throw new Error("Not implemented: POST /clients/:id/unblock")
}
