import { IconClockHour4 } from "@tabler/icons-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

type ComingSoonProps = {
  title?: string
  description?: string
}

export function ComingSoon({
  title = "Coming soon",
  description = "Esta pantalla se conectará a la API en un próximo paso.",
}: ComingSoonProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Empty className="max-w-md border border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <IconClockHour4 />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  )
}
