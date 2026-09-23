import { useState } from "react"
import { useNavigate } from "react-router"
import {
  IconBox,
  IconChartBar,
  IconEye,
  IconLogout,
  IconReceipt,
  IconTruckDelivery,
  IconUsers,
  type Icon,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { LogoutDialog } from "@/shared/ui/logout-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
  { to: "/admin/monitoreo", label: "Monitoreo", icon: IconEye },
  { to: "/admin/reportes", label: "Reportes", icon: IconChartBar },
]

type AdminMobileNavProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminMobileNav({ open, onOpenChange }: AdminMobileNavProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleNavigate = (to: string) => {
    onOpenChange(false)
    navigate(to)
  }

  const handleLogout = async () => {
    clearCart()
    await logout()
    setLogoutOpen(false)
    onOpenChange(false)
    navigate("/login", { replace: true })
  }

  const initials = user ? getInitials(displayName(user)) : "?"

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="left"
          className="flex w-72 max-w-[85vw] flex-col gap-0 p-0"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de administración</SheetTitle>
            <SheetDescription>
              Navegación del panel de control de Distribuidora NOA
            </SheetDescription>
          </SheetHeader>
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-medium tracking-tight">
                Distribuidora NOA
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Panel de control
              </span>
            </span>
          </div>

          <nav
            aria-label="Administración"
            className="flex-1 overflow-y-auto p-3"
          >
            <ul className="flex flex-col gap-0.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.to)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
                      "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden
                    />
                    <span className="truncate">{item.label}</span>
                  </button>
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
        </SheetContent>
      </Sheet>
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </>
  )
}
