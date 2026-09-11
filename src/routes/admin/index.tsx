import { useEffect } from "react"

import { ComingSoon } from "@/shared/ui/coming-soon"

export function AdminDashboardPage() {
  useEffect(() => {
    document.title = "Panel de control · Distribuidora NOA"
  }, [])

  return <ComingSoon title="Panel de control" />
}
