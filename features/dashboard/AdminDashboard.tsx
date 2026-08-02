'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getMoldOrders, getUsers } from '@/services/api'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateTime } from '@/utils/formatters'
import { ClipboardList, Users, Clock, AlertTriangle } from 'lucide-react'
import type { MoldOrder, User } from '@/types'

export function AdminDashboard() {
  const [orders, setOrders] = useState<MoldOrder[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMoldOrders(), getUsers()])
      .then(([o, u]) => {
        setOrders(o)
        setUsers(u)
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'SENT' || o.status === 'RECEIVED').length,
    activeUsers: users.filter(u => u.active).length,
    inProgress: orders.filter(o => o.status === 'IN_PROCESS').length,
  }

  const recentOrders = orders.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Хянах самбар</h1>
        <p className="text-sm text-muted-foreground mt-1">Системийн ерөнхий тойм</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Нийт захиалга"
          value={stats.totalOrders}
          icon={ClipboardList}
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard
          title="Хүлээгдэж буй"
          value={stats.pendingOrders}
          icon={Clock}
          trend={{ value: 0, isPositive: false }}
        />
        <StatCard
          title="Идэвхтэй хэрэглэгч"
          value={stats.activeUsers}
          icon={Users}
        />
        <StatCard
          title="Боловсруулж байгаа"
          value={stats.inProgress}
          icon={AlertTriangle}
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
          <p className="text-sm text-muted-foreground text-center py-8">Захиалга байхгүй</p>
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
                      {order.seller.fullName} • {order.items.length} хэв • {formatDateTime(order.createdAt)}
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
