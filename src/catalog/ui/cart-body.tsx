import { useMemo } from "react"
import { IconShoppingCart, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { CartItemRow } from "@/catalog/ui/cart-item-row"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { selectCartSubtotal, useCartStore } from "@/catalog/cart-store"
import { formatCurrency } from "@/shared/lib/format"

type CartBodyProps = {
  onClose?: () => void
}

export function CartBody({ onClose }: CartBodyProps) {
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const subtotal = useMemo(() => selectCartSubtotal(items), [items])

  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0)

  const handleClear = () => {
    if (items.length === 0) return
    clear()
    toast.info("Pedido vaciado")
  }

  const handleConfirm = () => {
    if (items.length === 0) return
    toast.info("Próximamente se conectará a la API", {
      description: `Pedido de ${formatCurrency(subtotal)} listo para enviar.`,
    })
    clear()
    onClose?.()
  }

  return (
    <>
      <header className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <IconShoppingCart
            className="size-4 text-muted-foreground"
            aria-hidden
          />
          <h2 className="text-sm font-medium">Tu pedido</h2>
          {totalQuantity > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              {totalQuantity}
            </span>
          ) : null}
        </div>
        {items.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={handleClear}
            className="text-muted-foreground"
          >
            <IconTrash data-icon="inline-start" />
            Vaciar
          </Button>
        ) : null}
      </header>

      {items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-5">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <IconShoppingCart />
              </EmptyMedia>
              <EmptyTitle>Tu pedido está vacío</EmptyTitle>
              <EmptyDescription>
                Sumá productos del catálogo para empezar a armar tu pedido.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col divide-y divide-border overflow-y-auto px-5">
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </ul>
      )}

      <Separator />
      <footer className="flex shrink-0 flex-col gap-3 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Subtotal</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatCurrency(subtotal)}
          </span>
        </div>
        <Button
          type="button"
          size="lg"
          disabled={items.length === 0}
          onClick={handleConfirm}
          className="w-full"
        >
          Confirmar pedido
        </Button>
      </footer>
    </>
  )
}
