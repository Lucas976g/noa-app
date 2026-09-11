import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { CATEGORIES } from "@/catalog/categories"
import type { CategoryId } from "@/catalog/model"

type CategoryFilterProps = {
  value: CategoryId | "all"
  onChange: (value: CategoryId | "all") => void
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as CategoryId | "all")
      }}
      variant="outline"
      spacing={0}
      aria-label="Filtrar por categoría"
      className="flex-wrap"
    >
      <ToggleGroupItem value="all" aria-label="Todas las categorías">
        Todas
      </ToggleGroupItem>
      {CATEGORIES.map((category) => {
        const Icon = category.icon
        return (
          <ToggleGroupItem
            key={category.id}
            value={category.id}
            aria-label={category.label}
          >
            <Icon data-icon="inline-start" />
            {category.label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
