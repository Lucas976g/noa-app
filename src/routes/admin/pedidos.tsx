import { useEffect } from "react"

import { ComingSoon } from "@/shared/ui/coming-soon"

export function AdminPedidosPage() {
  useEffect(() => {
    document.title = "Pedidos · Distribuidora NOA"
  }, [])

  return <ComingSoon title="Pedidos" />
}
