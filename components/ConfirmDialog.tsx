'use client'

import { AlertTriangle, X } from 'lucide-react'

interface Props {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'destructive' | 'default'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: React.ReactNode
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Баталгаажуулах',
  cancelLabel = 'Болих',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
  children,
}: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-md p-6">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-start gap-3 mb-4">
          {(variant === 'danger' || variant === 'destructive') && (
            <div className="rounded-full bg-red-100 p-2 flex-shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          )}
          <div>
            <h2 className="font-semibold text-foreground text-base">{title}</h2>
            {description && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{description}</p>}
          </div>
        </div>
        {children && <div className="mb-4">{children}</div>}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 ${
              variant === 'danger' || variant === 'destructive'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {loading && (
              <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
