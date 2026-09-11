import type { ReactNode } from "react"
import { Outlet } from "react-router"

import { AdminSidebar } from "@/layout/admin-sidebar"
import { AdminTopbar } from "@/layout/admin-topbar"
import { PageTransition } from "@/layout/page-transition"

type AdminShellProps = {
  children?: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <div className="flex h-svh flex-col bg-background text-foreground lg:flex-row">
      <AdminTopbar />
      <div className="flex min-h-0 flex-1 flex-row">
        <AdminSidebar />
        <PageTransition>
          <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
            {children ?? <Outlet />}
          </main>
        </PageTransition>
      </div>
    </div>
  )
}
