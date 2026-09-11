import { useState } from "react"
import { Link } from "react-router"
import { IconBuildingWarehouse, IconMenu2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { AdminMobileNav } from "@/layout/admin-mobile-nav"

export function AdminTopbar() {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link
          to="/admin"
          className="flex items-center gap-2 text-sm font-medium tracking-tight"
        >
          <IconBuildingWarehouse
            className="size-5 shrink-0 text-primary"
            aria-hidden
          />
          <span className="truncate">Distribuidora NOA</span>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setNavOpen(true)}
          aria-label="Abrir menú de navegación"
        >
          <IconMenu2 aria-hidden />
        </Button>
      </header>
      <AdminMobileNav open={navOpen} onOpenChange={setNavOpen} />
    </>
  )
}
