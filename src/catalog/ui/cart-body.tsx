import { useId, useMemo, useState } from "react"
import { IconShoppingCart, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { CartItemRow } from "@/catalog/ui/cart-item-row"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { checkAccount } from "@/clients/api"
import type { Account, AccountBlockReason } from "@/clients/model"
import { OrderBlockedDialog } from "@/clients/ui/order-blocked-dialog"
import { displayName } from "@/auth/model"
import { useAuthStore } from "@/auth/session-store"
import { useOrdersStore } from "@/orders/store"
import { PAYMENT_METHODS, type PaymentMethod } from "@/orders/model"
import { cn } from "@/shared/lib/utils"
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
  const user = useAuthStore((s) => s.user)
  const createOrder = useOrdersStore((s) => s.createOrder)
  const subtotal = useMemo(() => selectCartSubtotal(items), [items])

  const idPrefix = useId()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("contado")
  const [isChecking, setIsChecking] = useState(false)
  const [blocked, setBlocked] = useState<{
    reason: AccountBlockReason
    shortfall: number
    account: Account
  } | null>(null)

  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0)

  const handleClear = () => {
    if (items.length === 0) return
    clear()
    toast.info("Pedido vaciado")
  }

  const handleConfirm = async () => {
    if (items.length === 0 || isChecking) return

    setIsChecking(true)
    try {
      if (paymentMethod === "cuenta-corriente") {
        const { result, account } = await checkAccount(subtotal)
        if (!result.ok) {
          setBlocked({
            reason: result.reason,
            shortfall: result.shortfall,
            account,
          })
          return
        }
      }

      if (!user) {
        throw new Error("Iniciá sesión para confirmar el pedido.")
      }
      await createOrder({
        userId: user.id,
        userName: displayName(user),
        items,
        subtotal,
        paymentMethod,
      })
      toast.success("Pedido confirmado", {
        description: `Pedido de ${formatCurrency(subtotal)} registrado.`,
      })
      clear()
      onClose?.()
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "No pudimos confirmar el pedido."
      )
    } finally {
      setIsChecking(false)
    }
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
        <RadioGroup
          value={paymentMethod}
          onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
          aria-label="Forma de pago"
          className="gap-2"
        >
          {PAYMENT_METHODS.map((method) => {
            const id = `${idPrefix}-${method.id}`
            return (
              <label
                key={method.id}
                htmlFor={id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition-colors",
                  paymentMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/40"
                )}
              >
                <RadioGroupItem id={id} value={method.id} />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{method.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {method.description}
                  </span>
                </div>
              </label>
            )
          })}
        </RadioGroup>
        <Button
          type="button"
          size="lg"
          disabled={items.length === 0 || isChecking}
          onClick={handleConfirm}
          className="w-full"
        >
          {isChecking ? "Confirmando..." : "Confirmar pedido"}
        </Button>
      </footer>

      {blocked ? (
        <OrderBlockedDialog
          open
          onOpenChange={(open) => {
            if (!open) setBlocked(null)
          }}
          reason={blocked.reason}
          account={blocked.account}
          subtotal={subtotal}
          shortfall={blocked.shortfall}
        />
      ) : null}
    </>
  )
}
