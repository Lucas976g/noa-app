import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Account } from "./model"

type ClientsState = {
  clients: Account[]
}

export const useClientsStore = create<ClientsState>()(
  persist(
    () => ({
      clients: [] as Account[],
    }),
    {
      name: "noa-clients",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ clients: state.clients }),
    }
  )
)
