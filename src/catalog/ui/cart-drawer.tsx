import { CartBody } from "@/catalog/ui/cart-body"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type CartDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Tu pedido</SheetTitle>
          <SheetDescription>
            Revisá los productos sumados a tu pedido antes de confirmar.
          </SheetDescription>
        </SheetHeader>
        <CartBody onClose={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  )
}
