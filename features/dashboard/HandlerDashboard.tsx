'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getStoredOrders } from '@/lib/store'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateTime } from '@/utils/formatters'
import { Inbox, Clock, Package, Truck, AlertTriangle, ChevronRight } from 'lucide-react'

export function HandlerDashboard() {
  const { user } = useAuth()
  const allOrders = getStoredOrders()
  const myOrders = useMemo(
    () => allOrders.filter((o) => o.cityHandlerId === user?.id),
    [allOrders, user]
  )

  const now = Date.now()
  const counts = useMemo(() => ({
    new: myOrders.filter((o) => o.status === 'SENT').length,
    received: myOrders.filter((o) => o.status === 'RECEIVED').length,
    inProcess: myOrders.filter((o) => o.status === 'IN_PROCESS').length,
    transported: myOrders.filter((o) => o.status === 'TRANSPORTED').length,
    todayTransported: myOrders.filter((o) => {
      if (o.status !== 'TRANSPORTED' || !o.transportedAt) return false
      const d = new Date(o.transportedAt)
      const today = new Date(); today.setHours(0, 0, 0, 0)
      return d >= today
    }).length,
    delayed: myOrders.filter((o) => {
      if (o.status !== 'SENT') return false
      return (now - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24) > 3
    }).length,
  }), [myOrders, now])

  // Priority queue: SENT orders sorted oldest first
  const priorityQueue = [...myOrders]
    .filter((o) => o.status === 'SENT')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(0, 5)

  const recent = [...myOrders]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Сайн байна уу, {user?.fullName}!</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Хотын ажилтан &middot; {user?.organizationName}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Шинэ ирсэн захиалга" value={counts.new} icon={Inbox} iconColor="text-blue-600" />
        <StatCard label="Хүлээн авсан" value={counts.received} icon={Clock} iconColor="text-amber-600" />
        <StatCard label="Бэлтгэж байгаа" value={counts.inProcess} icon={Package} iconColor="text-orange-600" />
        <StatCard label="Унаанд тавьсан (нийт)" value={counts.transported} icon={Truck} iconColor="text-green-600" />
        <StatCard label="Өнөөдөр тавьсан" value={counts.todayTransported} icon={Truck} iconColor="text-green-600" />
        <StatCard label="Хоцорсон захиалга" value={counts.delayed} icon={AlertTriangle} iconColor="text-red-600" />
      </div>

      {/* Priority queue */}
      {priorityQueue.length > 0 && (
        <div className="bg-card border border-amber-200 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-semibold text-amber-800">Хүлээн авах шаардлагатай захиалгууд</h2>
          </div>
          <div className="divide-y divide-border">
            {priorityQueue.map((o) => {
              const ageDays = Math.floor((now - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24))
              return (
                <Link
                  key={o.id}
                  href={`/orders/${o.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{o.orderNumber}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {o.province} &middot; {o.provinceSellerName} &middot; {o.moldCodes.length} загвар
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {ageDays > 3 && (
                      <span className="text-xs text-red-600 font-medium">{ageDays} өдөр</span>
                    )}
                    <StatusBadge status={o.status} size="sm" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Сүүлийн захиалгууд</h2>
          <Link href="/orders" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Бүгдийг харах <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-secondary/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{o.orderNumber}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {o.province} &middot; {o.provinceSellerName} &middot; {formatDateTime(o.updatedAt)}
                </p>
              </div>
              <StatusBadge status={o.status} size="sm" />
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
