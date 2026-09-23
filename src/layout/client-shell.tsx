import type { ReactNode } from "react"

import { Navbar } from "@/layout/navbar"
import { PageTransition } from "@/layout/page-transition"

type ClientShellProps = {
  children: ReactNode
}

export function ClientShell({ children }: ClientShellProps) {
  return (
    <div className="flex h-svh flex-col bg-background text-foreground">
      <Navbar />
      <PageTransition>
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </PageTransition>
    </div>
  )
}
