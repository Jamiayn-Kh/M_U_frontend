'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getMoldOrdersWithRecentDetails } from '@/services/api'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateTime } from '@/utils/formatters'
import { getEffectiveOrderSummary } from '@/utils/order-adjustments'
import { ClipboardList, Clock, CheckCircle2, Plus } from 'lucide-react'
import type { MoldOrder } from '@/types'

export function SellerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<MoldOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMoldOrdersWithRecentDetails()
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'SENT' || o.status === 'RECEIVED' || o.status === 'IN_PROCESS').length,
    transported: orders.filter(o => o.status === 'TRANSPORTED').length,
    completed: orders.filter(o => o.status === 'COMPLETED').length,
  }

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Хянах самбар</h1>
          <p className="text-sm text-muted-foreground mt-1">Таны захиалгуудын тойм</p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Шинэ захиалга
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Нийт захиалга"
          value={stats.total}
          icon={ClipboardList}
        />
        <StatCard
          title="Явцад"
          value={stats.pending}
          icon={Clock}
        />
        <StatCard
          title="Унаанд тавьсан"
          value={stats.transported}
          icon={CheckCircle2}
        />
        <StatCard
          title="Дууссан"
          value={stats.completed}
          icon={CheckCircle2}
        />
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Сүүлийн захиалгууд</h2>
          <Link href="/orders" className="text-xs text-primary hover:underline">
            Бүгдийг харах →
          </Link>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground mb-4">Захиалга байхгүй байна</p>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" /> Эхний захиалга үүсгэх
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-medium text-foreground">#{order.id}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getEffectiveOrderSummary(order.items).totalQuantity} хэв • {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
