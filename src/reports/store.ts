import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { CashClosing } from "./model"

type ReportsState = {
  cashClosings: CashClosing[]
}

export const useReportsStore = create<ReportsState>()(
  persist(
    () => ({
      cashClosings: [] as CashClosing[],
    }),
    {
      name: "noa-reports",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ cashClosings: state.cashClosings }),
    }
  )
)
