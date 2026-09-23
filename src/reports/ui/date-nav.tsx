import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { formatDate } from "@/shared/lib/format"
import { cn } from "@/shared/lib/utils"

type DateNavProps = {
  date: Date
  canGoPrev: boolean
  canGoNext: boolean
  onPrev: () => void
  onNext: () => void
}

export function DateNav({
  date,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
}: DateNavProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onPrev}
        disabled={!canGoPrev}
        aria-label="Día anterior"
      >
        <IconChevronLeft />
      </Button>
      <div
        className={cn(
          "flex items-center gap-2 px-2 text-sm font-medium tabular-nums"
        )}
      >
        <IconCalendar className="size-3.5 text-muted-foreground" aria-hidden />
        <span>{formatDate(date.toISOString())}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onNext}
        disabled={!canGoNext}
        aria-label="Día siguiente"
      >
        <IconChevronRight />
      </Button>
    </div>
  )
}
