'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AppLayout } from '@/components/AppLayout'
import { EmptyState } from '@/components/EmptyState'
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '@/services/api'
import { formatDateTime } from '@/utils/formatters'
import { Bell, CheckCheck, Package, Truck, Clock, Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import type { Notification } from '@/types'

const TYPE_ICON: Record<Notification['type'], React.ElementType> = {
  new_order: Bell,
  order_received: CheckCheck,
  order_transported: Truck,
  order_delayed: Clock,
  general: Star,
}

const TYPE_COLOR: Record<Notification['type'], string> = {
  new_order: 'bg-blue-100 text-blue-600',
  order_received: 'bg-amber-100 text-amber-600',
  order_transported: 'bg-green-100 text-green-700',
  order_delayed: 'bg-red-100 text-red-600',
  general: 'bg-secondary text-muted-foreground',
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    getNotifications(user.id).then((n) => {
      setNotifications(n)
      setLoading(false)
    })
  }, [user])

  async function handleMarkRead(id: string) {
    await markNotificationRead(id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function handleMarkAll() {
    if (!user) return
    await markAllNotificationsRead(user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Мэдэгдэл</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-0.5">{unreadCount} уншаагүй мэдэгдэл</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <CheckCheck className="h-4 w-4" />
              Бүгдийг уншсан болгох
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            title="Мэдэгдэл байхгүй байна"
            description="Захиалгын статус өөрчлөгдөхөд энд харагдана."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell
              const iconColor = TYPE_COLOR[n.type] ?? 'bg-secondary text-muted-foreground'
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                    !n.read
                      ? 'bg-card border-primary/20 shadow-sm'
                      : 'bg-card border-border opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</span>
                      {n.orderNumber && (
                        <Link
                          href={`/orders/${n.orderId}`}
                          className="text-xs text-primary hover:underline flex items-center gap-0.5"
                        >
                          {n.orderNumber}
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      )}
                      {!n.read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Уншсан болгох
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
