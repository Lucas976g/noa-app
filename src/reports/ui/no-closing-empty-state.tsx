import { IconClock, IconLock } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { formatDate } from "@/shared/lib/format"

type NoClosingEmptyStateProps = {
  date: Date
  canGenerate: boolean
  isWithinWindow: boolean
  onGenerate: () => void
}

export function NoClosingEmptyState({
  date,
  canGenerate,
  isWithinWindow,
  onGenerate,
}: NoClosingEmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border bg-card/30 px-6 py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconLock />
          </EmptyMedia>
          <EmptyTitle>
            El cierre del {formatDate(date.toISOString())} aún no se generó
          </EmptyTitle>
          <EmptyDescription>
            {isWithinWindow
              ? "Cuando se cierre la jornada vas a poder generar el resumen de caja de este día desde acá."
              : "Podés generar el cierre a modo de ejemplo para ver cómo funciona la interfaz."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          {canGenerate ? (
            <Button type="button" onClick={onGenerate}>
              {isWithinWindow ? "Generar cierre" : "Generar cierre (demo)"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <IconClock className="size-3.5" aria-hidden />
              <span>Seleccioná el día de hoy para generar el cierre</span>
            </div>
          )}
        </EmptyContent>
      </Empty>
    </div>
  )
}
