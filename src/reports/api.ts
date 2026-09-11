import type { CashClosing } from "./model"

// GET /reports/cash-closings — listar arqueos
export const fetchCashClosings = async (): Promise<CashClosing[]> => {
  // TODO: implementar
  // return apiFetch<CashClosing[]>("/reports/cash-closings")
  throw new Error("Not implemented: GET /reports/cash-closings")
}

// POST /reports/cash-closings — generar arqueo
export const generateCashClosing = async (): Promise<CashClosing> => {
  // TODO: implementar
  // return apiFetch<CashClosing>("/reports/cash-closings", { method: "POST", body: JSON.stringify({ date }) })
  throw new Error("Not implemented: POST /reports/cash-closings")
}
