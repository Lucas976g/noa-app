import { useEffect } from "react"

import { ComingSoon } from "@/shared/ui/coming-soon"

export function AdminReportesPage() {
  useEffect(() => {
    document.title = "Reportes · Distribuidora NOA"
  }, [])

  return <ComingSoon title="Reportes" />
}
