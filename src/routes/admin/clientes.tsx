import { useEffect } from "react"

import { ComingSoon } from "@/shared/ui/coming-soon"

export function AdminClientesPage() {
  useEffect(() => {
    document.title = "Clientes · Distribuidora NOA"
  }, [])

  return <ComingSoon title="Clientes" />
}
