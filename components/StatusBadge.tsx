import { statusLabel, statusColor, statusDot } from '@/utils/formatters'
import type { MoldOrderStatus } from '@/types'

interface Props {
  status: MoldOrderStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const colorClass = statusColor(status)
  const dotClass = statusDot(status)
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${colorClass} ${sizeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotClass}`} />
      {statusLabel(status)}
    </span>
  )
}
