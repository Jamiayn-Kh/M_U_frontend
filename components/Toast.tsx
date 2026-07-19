'use client'

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `toast-${++counter.current}`
    setToasts((prev) => [...prev, { ...item, id }])
    setTimeout(() => dismiss(id), 4000)
  }, [dismiss])

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast])
  const error = useCallback((title: string, message?: string) => toast({ type: 'error', title, message }), [toast])
  const info = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />,
    error: <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />,
    info: <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />,
  }
  const borderColors = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    info: 'border-l-blue-500',
  }

  return (
    <div
      className={`bg-card border border-border border-l-4 ${borderColors[item.type]} rounded-lg shadow-lg p-3 flex gap-3 animate-in slide-in-from-right-full`}
    >
      {icons[item.type]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{item.title}</p>
        {item.message && <p className="text-xs text-muted-foreground mt-0.5">{item.message}</p>}
      </div>
      <button onClick={onDismiss} className="text-muted-foreground hover:text-foreground flex-shrink-0">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
