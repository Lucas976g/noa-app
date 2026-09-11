import { useEffect, useRef, useState } from "react"
import { IconShoppingCart } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { useCartStore } from "@/catalog/cart-store"
import { cn } from "@/shared/lib/utils"

type CartButtonProps = {
  onClick: () => void
}

const BUMP_DURATION_MS = 350

export function CartButton({ onClick }: CartButtonProps) {
  const items = useCartStore((s) => s.items)
  const count = items.reduce((acc, i) => acc + i.quantity, 0)
  const [bumping, setBumping] = useState(false)
  const previousCountRef = useRef(count)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (count > previousCountRef.current) {
      setBumping(true)
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = window.setTimeout(() => {
        setBumping(false)
      }, BUMP_DURATION_MS)
    }
    previousCountRef.current = count
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [count])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label={`Abrir pedido${count > 0 ? `, ${count} ${count === 1 ? "unidad" : "unidades"}` : ""}`}
      className="relative"
    >
      <IconShoppingCart
        className={cn(
          "transition-transform duration-300",
          bumping && "animate-bump"
        )}
        aria-hidden
      />
      {count > 0 ? (
        <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Button>
  )
}
