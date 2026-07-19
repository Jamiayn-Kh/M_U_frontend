import type { LucideIcon } from 'lucide-react'

interface Props {
  label: string
  value: number | string
  icon: LucideIcon
  iconColor?: string
  sub?: string
  onClick?: () => void
}

export function StatCard({ label, value, icon: Icon, iconColor = 'text-primary', sub, onClick }: Props) {
  return (
    <div
      className={`bg-card border border-border rounded-xl p-5 flex items-start gap-4 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md hover:border-primary/30 transition-all' : ''}`}
      onClick={onClick}
    >
      <div className={`rounded-lg p-2.5 bg-secondary ${iconColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  )
}
