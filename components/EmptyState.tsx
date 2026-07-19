import type { LucideIcon } from 'lucide-react'

interface Props {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="rounded-full bg-secondary p-4 mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
