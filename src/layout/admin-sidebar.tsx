import { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router"
import {
  IconBox,
  IconBuildingWarehouse,
  IconChartBar,
  IconLogout,
  IconReceipt,
  IconTruckDelivery,
  IconUsers,
  type Icon,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { LogoutDialog } from "@/shared/ui/logout-dialog"
import { useAuthStore } from "@/auth/session-store"
import { displayName } from "@/auth/model"
import { useCartStore } from "@/catalog/cart-store"
import { getInitials } from "@/shared/lib/initials"
import { cn } from "@/shared/lib/utils"

type NavItem = {
  to: string
  label: string
  icon: Icon
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: "/admin/pedidos", label: "Pedidos", icon: IconReceipt },
  { to: "/admin/inventario", label: "Inventario", icon: IconBox },
  { to: "/admin/clientes", label: "Clientes", icon: IconUsers },
  { to: "/admin/logistica", label: "Logística", icon: IconTruckDelivery },
  { to: "/admin/reportes", label: "Reportes", icon: IconChartBar },
]

export function AdminSidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = () => {
    clearCart()
    logout()
    navigate("/login", { replace: true })
  }

  const initials = user ? getInitials(displayName(user)) : "?"

  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <Link
        to="/admin"
        className="flex items-center gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-muted/40"
      >
        <IconBuildingWarehouse
          className="size-5 shrink-0 text-primary"
          aria-hidden
        />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-medium tracking-tight">
            Distribuidora NOA
          </span>
          <span className="truncate text-xs text-muted-foreground">
            Panel de control
          </span>
        </span>
      </Link>

      <nav aria-label="Administración" className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={cn(
                        "size-4 shrink-0",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}
                      aria-hidden
                    />
                    <span className="truncate">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
            aria-hidden
          >
            {initials}
          </div>
          <span className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-medium">
              {user ? displayName(user) : "Sin sesión"}
            </span>
            <span className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </span>
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setLogoutOpen(true)}
          aria-label="Cerrar sesión"
          className="w-full"
        >
          <IconLogout data-icon="inline-start" />
          Salir
        </Button>
      </div>
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </aside>
  )
}
