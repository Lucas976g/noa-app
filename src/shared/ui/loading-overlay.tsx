import { Spinner } from "@/components/ui/spinner"

type LoadingOverlayProps = {
  message?: string
}

export function LoadingOverlay({ message = "Cargando…" }: LoadingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-6 text-muted-foreground" />
      {message ? (
        <span className="text-sm text-muted-foreground">{message}</span>
      ) : null}
    </div>
  )
}
