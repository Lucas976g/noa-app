import { useEffect } from "react"

import { ComingSoon } from "@/shared/ui/coming-soon"

export function AdminLogisticaPage() {
  useEffect(() => {
    document.title = "Logística · Distribuidora NOA"
  }, [])

  return <ComingSoon title="Logística" />
}
