import type { StatusHistory } from '@/types'
import { statusLabel, roleLabel, formatDateTime } from '@/utils/formatters'
import { CheckCircle2, Circle, XCircle, Package, Truck, Clock } from 'lucide-react'
import type { OrderStatus } from '@/types'

function StatusIcon({ status }: { status: OrderStatus }) {
  const classes = 'h-4 w-4 flex-shrink-0'
  switch (status) {
    case 'SENT': return <Clock className={`${classes} text-blue-500`} />
    case 'RECEIVED': return <CheckCircle2 className={`${classes} text-amber-500`} />
    case 'IN_PROCESS': return <Package className={`${classes} text-orange-500`} />
    case 'TRANSPORTED': return <Truck className={`${classes} text-green-500`} />
    case 'CANCELLED': return <XCircle className={`${classes} text-red-500`} />
    default: return <Circle className={`${classes} text-slate-400`} />
  }
}

interface Props {
  history: StatusHistory[]
}

export function OrderTimeline({ history }: Props) {
  const sorted = [...history].sort(
    (a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime()
  )

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">Түүх байхгүй</p>
  }

  return (
    <ol className="relative space-y-0">
      {sorted.map((entry, idx) => (
        <li key={entry.id} className="flex gap-4">
          {/* Connector */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-secondary border border-border flex-shrink-0 z-10">
              <StatusIcon status={entry.newStatus} />
            </div>
            {idx < sorted.length - 1 && (
              <div className="w-px flex-1 bg-border min-h-4 my-1" />
            )}
          </div>
          {/* Content */}
          <div className="pb-5 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {statusLabel(entry.newStatus)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {entry.changedBy} &middot; {roleLabel(entry.changedByRole)}
                </p>
                {entry.note && (
                  <p className="text-xs text-muted-foreground mt-1 italic">&ldquo;{entry.note}&rdquo;</p>
                )}
              </div>
              <time className="text-xs text-muted-foreground flex-shrink-0 tabular-nums">
                {formatDateTime(entry.changedAt)}
              </time>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
