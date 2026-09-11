import { CartBody } from "@/catalog/ui/cart-body"

export function CartSummary() {
  return (
    <aside className="sticky top-0 hidden max-h-svh max-w-sm flex-col border-l border-border bg-card lg:flex">
      <CartBody />
    </aside>
  )
}
