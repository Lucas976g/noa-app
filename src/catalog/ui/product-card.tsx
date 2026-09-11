import { IconMinus, IconPlus } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCategory } from "@/catalog/categories"
import { formatCurrency } from "@/shared/lib/format"
import { useCartStore } from "@/catalog/cart-store"
import type { Product } from "@/catalog/model"
import { cn } from "@/shared/lib/utils"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const item = useCartStore((s) =>
    s.items.find((i) => i.productId === product.id)
  )
  const addItem = useCartStore((s) => s.addItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)

  const category = getCategory(product.category)
  const Icon = category.icon
  const inCart = Boolean(item)
  const quantity = item?.quantity ?? 0

  return (
    <Card className="flex h-full flex-col">
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div
            className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground"
            aria-hidden
          >
            <Icon className="size-5" />
          </div>
          <Badge variant="outline" className="font-normal">
            {product.unit}
          </Badge>
        </div>
        <div className="flex-1">
          <p className="text-sm leading-snug font-medium">{product.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{category.label}</p>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold tabular-nums">
            {formatCurrency(product.price)}
          </span>
          {inCart ? (
            <QuantityStepper
              quantity={quantity}
              onDecrease={() => updateQuantity(product.id, quantity - 1)}
              onIncrease={() => updateQuantity(product.id, quantity + 1)}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => addItem(product)}
              aria-label={`Agregar ${product.name}`}
            >
              <IconPlus data-icon="inline-start" />
              Agregar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

type QuantityStepperProps = {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
  className?: string
}

function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  className,
}: QuantityStepperProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border border-border bg-card",
        className
      )}
      role="group"
      aria-label="Cantidad"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDecrease}
        aria-label="Disminuir cantidad"
        className="rounded-r-none"
      >
        <IconMinus />
      </Button>
      <span
        className="min-w-6 text-center text-sm font-medium tabular-nums"
        aria-live="polite"
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onIncrease}
        aria-label="Aumentar cantidad"
        className="rounded-l-none"
      >
        <IconPlus />
      </Button>
    </div>
  )
}
