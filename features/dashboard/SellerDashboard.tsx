'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getStoredOrders } from '@/lib/store'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateTime } from '@/utils/formatters'
import { Plus, ClipboardList, Clock, Package, Truck, ChevronRight } from 'lucide-react'

export function SellerDashboard() {
  const { user } = useAuth()
  const allOrders = getStoredOrders()
  const myOrders = useMemo(
    () => allOrders.filter((o) => o.provinceSellerId === user?.id),
    [allOrders, user]
  )

  const counts = useMemo(() => ({
    total: myOrders.filter((o) => o.status !== 'DRAFT' && o.status !== 'CANCELLED').length,
    waiting: myOrders.filter((o) => o.status === 'SENT').length,
    inProcess: myOrders.filter((o) => o.status === 'IN_PROCESS' || o.status === 'RECEIVED').length,
    transported: myOrders.filter((o) => o.status === 'TRANSPORTED').length,
  }), [myOrders])

  const recent = [...myOrders]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Сайн байна уу, {user?.fullName}!</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{user?.province} &middot; {user?.organizationName}</p>
        </div>
        <Link
          href="/orders/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex-shrink-0"
        >
          <Plus className="h-4 w-4" />
          Шинэ захиалга үүсгэх
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Нийт захиалга" value={counts.total} icon={ClipboardList} />
        <StatCard label="Хүлээгдэж байгаа" value={counts.waiting} icon={Clock} iconColor="text-blue-600" />
        <StatCard label="Бэлтгэлт явагдаж байгаа" value={counts.inProcess} icon={Package} iconColor="text-orange-600" />
        <StatCard label="Унаанд тавьсан" value={counts.transported} icon={Truck} iconColor="text-green-600" />
      </div>

      {/* Recent orders */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Миний захиалгууд</h2>
          <Link href="/orders" className="text-xs text-primary hover:underline flex items-center gap-0.5">
            Бүгдийг харах <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground mb-3">Одоогоор захиалга байхгүй байна</p>
            <Link
              href="/orders/new"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium"
            >
              <Plus className="h-3.5 w-3.5" /> Анхны захиалга үүсгэх
            </Link>
          </div>
        ) : (
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
                    {o.cityHandlerName} &middot; {o.moldCodes.length} загвар &middot; {formatDateTime(o.updatedAt)}
                  </p>
                </div>
                <StatusBadge status={o.status} size="sm" />
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Workflow flow */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-foreground mb-4">Захиалгын дараалал</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {['Илгээсэн', 'Хүлээн авсан', 'Бэлтгэж байгаа', 'Унаанд тавьсан'].map((s, i, arr) => (
            <div key={s} className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm text-foreground font-medium">
                <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center">
                  {i + 1}
                </span>
                {s}
              </div>
              {i < arr.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
