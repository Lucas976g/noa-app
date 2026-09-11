import { IconAlertTriangle } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type DeleteProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  productSku: string
  onConfirm: () => void
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  productName,
  productSku,
  onConfirm,
}: DeleteProductDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <IconAlertTriangle className="size-4" />
            </div>
            <DialogTitle>Eliminar producto</DialogTitle>
          </div>
          <DialogDescription>
            Vas a eliminar{" "}
            <span className="font-medium text-foreground">«{productName}»</span>{" "}
            del catálogo. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">SKU</span>
          <Badge variant="outline" className="font-mono text-xs uppercase">
            #{productSku}
          </Badge>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Eliminar producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
