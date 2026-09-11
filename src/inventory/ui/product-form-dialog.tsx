import { useState } from "react"
import { IconBox, IconPencil } from "@tabler/icons-react"

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
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CATEGORIES } from "@/catalog/categories"
import type { CategoryId } from "@/catalog/model"
import type { Product, ProductForm } from "@/catalog/model"
import { cn } from "@/shared/lib/utils"

type ProductFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  product?: Product
  onConfirm: (input: ProductForm) => void
}

const DEFAULT_CATEGORY: CategoryId = "fiambres"

export function ProductFormDialog({
  open,
  onOpenChange,
  mode,
  product,
  onConfirm,
}: ProductFormDialogProps) {
  const isEdit = mode === "edit"
  const [name, setName] = useState(product?.name ?? "")
  const [category, setCategory] = useState<CategoryId>(
    product?.category ?? DEFAULT_CATEGORY
  )
  const [priceText, setPriceText] = useState<string>(
    product?.price.toString() ?? ""
  )
  const [unit, setUnit] = useState(product?.unit ?? "")

  const trimmedName = name.trim()
  const trimmedUnit = unit.trim()
  const price = Number.parseFloat(priceText)
  const hasValidPrice = !Number.isNaN(price) && price > 0
  const canConfirm =
    trimmedName.length >= 2 && hasValidPrice && trimmedUnit.length > 0

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm({
      name: trimmedName,
      category,
      price,
      unit: trimmedUnit,
    })
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("")
      setCategory(DEFAULT_CATEGORY)
      setPriceText("")
      setUnit("")
    }
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div
              className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground"
              aria-hidden
            >
              {isEdit ? (
                <IconPencil className="size-4" />
              ) : (
                <IconBox className="size-4" />
              )}
            </div>
            <DialogTitle>
              {isEdit ? "Editar producto" : "Agregar producto"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {isEdit
              ? "Modificá los datos del producto. El SKU no se puede cambiar."
              : "Cargá los datos del nuevo producto. El SKU se genera automáticamente."}
          </DialogDescription>
        </DialogHeader>

        <Field>
          <FieldLabel>SKU</FieldLabel>
          <div className="flex h-9 items-center rounded-md border border-border bg-muted/40 px-3">
            <Badge variant="outline" className="font-mono text-xs uppercase">
              {isEdit
                ? `#${product?.id.toUpperCase()}`
                : "Se asignará al guardar"}
            </Badge>
          </div>
          <FieldDescription>
            Identificador único del producto en el catálogo.
          </FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="product-name">Nombre</FieldLabel>
          <Input
            id="product-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Jamón cocido paleta"
            autoFocus={!isEdit}
          />
        </Field>

        <Field>
          <FieldLabel>Categoría</FieldLabel>
          <RadioGroup
            value={category}
            onValueChange={(value) => setCategory(value as CategoryId)}
            className="gap-2"
          >
            {CATEGORIES.map((opt) => {
              const Icon = opt.icon
              const id = `product-category-${opt.id}`
              return (
                <label
                  key={opt.id}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors",
                    category === opt.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/40"
                  )}
                >
                  <RadioGroupItem id={id} value={opt.id} />
                  <Icon className="size-4 text-muted-foreground" aria-hidden />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              )
            })}
          </RadioGroup>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="product-price">Precio</FieldLabel>
            <Input
              id="product-price"
              type="number"
              inputMode="decimal"
              min={0}
              step={0.01}
              value={priceText}
              onChange={(e) => setPriceText(e.target.value)}
              placeholder="0,00"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="product-unit">Unidad</FieldLabel>
            <Input
              id="product-unit"
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="x kg, x 1L, x 500g…"
            />
          </Field>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!canConfirm}>
            {isEdit ? "Guardar cambios" : "Agregar producto"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
