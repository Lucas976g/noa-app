import { useState } from "react"
import { IconLogout } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

export type LogoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void> | void
}

/**
 * Confirmation dialog for logging out.
 * Provides loading state and prevents closing while logout request is executing.
 */
export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      await onConfirm()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSubmitting) return
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-full bg-destructive/10 text-destructive"
              aria-hidden
            >
              <IconLogout className="size-4" />
            </div>
            <DialogTitle>Cerrar sesión</DialogTitle>
          </div>
          <DialogDescription>
            ¿Estás seguro que querés cerrar sesión?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isSubmitting}
            onClick={() => void handleConfirm()}
          >
            {isSubmitting ? (
              <>
                <Spinner data-icon="inline-start" />
                Cerrando sesión…
              </>
            ) : (
              <>
                <IconLogout data-icon="inline-start" />
                Cerrar sesión
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
