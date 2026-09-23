import { IconAlertCircle, IconWallet } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatCurrency } from "@/shared/lib/format"
import type { Account } from "@/clients/model"

type AccountCardProps = {
  account: Account
  className?: string
}

export function AccountCard({ account, className }: AccountCardProps) {
  const hasDebt = account.currentDebt > 0
  const usedPercentage =
    account.creditLimit > 0
      ? Math.min(
          100,
          Math.max(0, (account.currentDebt / account.creditLimit) * 100)
        )
      : 0

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2 text-muted-foreground">
          <IconWallet className="size-4" aria-hidden />
          <span className="text-xs tracking-wider uppercase">
            Cuenta corriente
          </span>
        </div>
        {hasDebt ? (
          <Badge variant="secondary">
            <IconAlertCircle data-icon="inline-start" />
            Con deuda
          </Badge>
        ) : (
          <Badge variant="outline">Al día</Badge>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">
            Saldo disponible
          </span>
          <span className="text-2xl font-semibold tabular-nums">
            {formatCurrency(account.availableBalance)}
          </span>
        </div>

        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(usedPercentage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Crédito utilizado"
        >
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${usedPercentage}%` }}
          />
        </div>

        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Deuda actual</span>
            <span className="text-sm font-medium tabular-nums">
              {formatCurrency(account.currentDebt)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-xs text-muted-foreground">
              Límite de crédito
            </span>
            <span className="text-sm font-medium tabular-nums">
              {formatCurrency(account.creditLimit)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
