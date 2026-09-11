import { IconSearch, IconX } from "@tabler/icons-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/shared/lib/utils"

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  className?: string
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar productos…",
  ariaLabel = "Buscar productos",
  className,
}: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <IconSearch
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-8"
        aria-label={ariaLabel}
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpiar búsqueda"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
        >
          <IconX className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
