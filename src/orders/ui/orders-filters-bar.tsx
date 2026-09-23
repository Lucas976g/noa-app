import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OrderStatusId, PaymentMethod } from "@/orders/model"
import { IconSearch, IconX } from "@tabler/icons-react"

export type OrdersFiltersBarProps = {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter?: OrderStatusId | "all"
  onStatusChange?: (status: OrderStatusId | "all") => void
  paymentFilter: PaymentMethod | "all"
  onPaymentChange: (payment: PaymentMethod | "all") => void
  statusCounts?: Partial<Record<OrderStatusId | "all", number>>
  placeholder?: string
}

const PAYMENT_OPTIONS: ReadonlyArray<{
  readonly id: PaymentMethod | "all"
  readonly label: string
}> = [
  { id: "all", label: "Todos" },
  { id: "cuenta-corriente", label: "Cta. Cte." },
  { id: "contado", label: "Contado" },
]

/**
 * Filter bar component for searching and categorizing orders.
 */
export function OrdersFiltersBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  paymentFilter,
  onPaymentChange,
  statusCounts,
  placeholder = "Buscar por ID, cliente o dirección...",
}: OrdersFiltersBarProps) {
  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    paymentFilter !== "all" ||
    (statusFilter !== undefined && statusFilter !== "all")

  const handleClearAll = () => {
    onSearchChange("")
    onPaymentChange("all")
    if (onStatusChange) {
      onStatusChange("all")
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search input with icons */}
        <div className="relative flex-1 sm:max-w-md">
          <IconSearch
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="h-9 pr-8 pl-9 text-xs"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Borrar búsqueda"
            >
              <IconX className="size-3.5" aria-hidden />
            </button>
          )}
        </div>

        {/* Payment Method Selector */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <span className="mr-1 text-xs text-muted-foreground">Pago:</span>
          {PAYMENT_OPTIONS.map((opt) => (
            <Button
              key={opt.id}
              type="button"
              variant={paymentFilter === opt.id ? "default" : "outline"}
              size="sm"
              className={`h-7 px-2.5 text-xs ${
                paymentFilter === opt.id
                  ? "font-semibold"
                  : "text-muted-foreground"
              }`}
              onClick={() => onPaymentChange(opt.id)}
            >
              {opt.label}
            </Button>
          ))}

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
            >
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Optional Status Pill Buttons */}
      {statusFilter !== undefined && onStatusChange && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="mr-1 text-xs text-muted-foreground">Estado:</span>
          {(
            [
              { id: "all", label: "Todos" },
              { id: "en-analisis", label: "En análisis" },
              { id: "en-proceso", label: "En proceso" },
              { id: "entregado", label: "Entregados" },
              { id: "cancelado", label: "Cancelados" },
            ] as const
          ).map((s) => {
            const count = statusCounts?.[s.id]
            const isSelected = statusFilter === s.id
            return (
              <Button
                key={s.id}
                type="button"
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 gap-1.5 px-2.5 text-xs ${
                  isSelected ? "font-semibold" : "text-muted-foreground"
                }`}
                onClick={() => onStatusChange(s.id)}
              >
                <span>{s.label}</span>
                {count !== undefined && (
                  <span
                    className={`py-0.2 rounded-full px-1.5 text-[10px] tabular-nums ${
                      isSelected
                        ? "bg-foreground/10 text-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}
