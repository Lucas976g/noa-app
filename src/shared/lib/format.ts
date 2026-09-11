const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export const formatCurrency = (value: number): string =>
  currencyFormatter.format(value)

export const formatDate = (iso: string): string =>
  dateFormatter.format(new Date(iso))

export const formatDateTime = (iso: string): string =>
  dateTimeFormatter.format(new Date(iso))
