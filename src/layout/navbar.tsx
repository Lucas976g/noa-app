import { useState } from "react"
import { NavLink, useNavigate } from "react-router"
import {
  IconBuildingWarehouse,
  IconLogout,
  IconMenu2,
} from "@tabler/icons-react"

import { CartButton } from "@/catalog/ui/cart-button"
import { CartDrawer } from "@/catalog/ui/cart-drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LogoutDialog } from "@/shared/ui/logout-dialog"
import { useAuthStore } from "@/auth/session-store"
import { displayName } from "@/auth/model"
import { useCartStore } from "@/catalog/cart-store"
import { cn } from "@/shared/lib/utils"

type NavItem = {
  to: string
  label: string
}

const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { to: "/catalogo", label: "Catálogo" },
  { to: "/pedidos", label: "Pedidos" },
]

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const handleLogout = async () => {
    clearCart()
    await logout()
    setLogoutOpen(false)
    setMenuOpen(false)
    navigate("/login", { replace: true })
  }

  const handleNavigate = (to: string) => {
    setMenuOpen(false)
    navigate(to)
  }

  const isClient = user?.role === "cliente"

  return (
    <>
      <header className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <NavLink
            to="/catalogo"
            className="flex min-w-0 items-center gap-2 text-sm font-medium tracking-tight"
          >
            <IconBuildingWarehouse
              className="size-5 shrink-0 text-primary"
              aria-hidden
            />
            <span className="truncate">Distribuidora NOA</span>
          </NavLink>
          <nav
            aria-label="Principal"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/pedidos"}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-1.5 text-sm transition-colors",
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {isClient ? (
            <div className="lg:hidden">
              <CartButton onClick={() => setCartOpen(true)} />
            </div>
          ) : null}
          {user ? (
            <span className="hidden text-sm text-muted-foreground lg:inline">
              {displayName(user)}
            </span>
          ) : null}
          <Separator orientation="vertical" className="hidden h-5 lg:block" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLogoutOpen(true)}
            aria-label="Cerrar sesión"
            className="hidden lg:inline-flex"
          >
            <IconLogout data-icon="inline-start" />
            Salir
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú de navegación"
            className="lg:hidden"
          >
            <IconMenu2 aria-hidden />
          </Button>
        </div>
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="flex w-72 max-w-[85vw] flex-col gap-0 p-0"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Menú principal</SheetTitle>
            <SheetDescription>Navegación de Distribuidora NOA</SheetDescription>
          </SheetHeader>
          <div className="border-b border-border px-5 py-4">
            <span className="text-sm font-medium tracking-tight">
              Distribuidora NOA
            </span>
          </div>
          <nav aria-label="Principal" className="flex-1 overflow-y-auto p-3">
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
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto border-t border-border p-3">
            {user ? (
              <div className="mb-2 flex items-center gap-3 rounded-md px-2 py-2">
                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                  <span className="truncate text-sm font-medium">
                    {displayName(user)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            ) : null}
            <Button
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

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <LogoutDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        onConfirm={handleLogout}
      />
    </>
  )
}
