import { useEffect } from "react"

import { ComingSoon } from "@/shared/ui/coming-soon"

export function AdminInventarioPage() {
  useEffect(() => {
    document.title = "Inventario · Distribuidora NOA"
  }, [])

  return <ComingSoon title="Inventario" />
}
