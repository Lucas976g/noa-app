import type { ReactNode } from "react"
import { useLocation } from "react-router"

type PageTransitionProps = {
  children: ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  const location = useLocation()
  return (
    <div
      key={location.pathname}
      className="flex min-h-0 min-w-0 flex-1 flex-col animate-page-in"
    >
      {children}
    </div>
  )
}
