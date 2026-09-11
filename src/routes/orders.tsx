import { useEffect } from "react"

import { ClientShell } from "@/layout/client-shell"
import { ComingSoon } from "@/shared/ui/coming-soon"

export function OrdersPage() {
  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
  }, [])

  return (
    <ClientShell>
      <ComingSoon title="Pedidos" />
    </ClientShell>
  )
}
