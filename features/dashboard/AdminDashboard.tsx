'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { getStoredOrders, getStoredUsers } from '@/lib/store'
import { StatCard } from '@/components/StatCard'
import { StatusBadge } from '@/components/StatusBadge'
import { formatDateTime, totalQuantity } from '@/utils/formatters'
import {
  ClipboardList, Send, CheckCircle2, Package, Truck,
  Users, Clock, AlertTriangle, ChevronRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import type { MoldOrder } from '@/types'

const RANGE_OPTIONS = [
  { label: 'Өнөөдөр', days: 1 },
  { label: '7 хоног', days: 7 },
  { label: '30 хоног', days: 30 },
]

export function AdminDashboard() {
  const [range, setRange] = useState(7)
  const orders = getStoredOrders()
  const users = getStoredUsers()

  const now = Date.now()
  const filtered = useMemo(() => {
    const cutoff = now - range * 24 * 60 * 60 * 1000
    return orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff)
  }, [orders, range, now])

  const counts = useMemo(() => ({
    total: orders.length,
    sent: orders.filter((o) => o.status === 'SENT').length,
    received: orders.filter((o) => o.status === 'RECEIVED').length,
    inProcess: orders.filter((o) => o.status === 'IN_PROCESS').length,
    transported: orders.filter((o) => o.status === 'TRANSPORTED').length,
    activeUsers: users.filter((u) => u.active).length,
  }), [orders, users])

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today).length

  const delayed = orders.filter((o) => {
    if (o.status !== 'SENT') return false
    const diff = (now - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return diff > 3
  }).length

  const statusChartData = [
    { name: 'Илгээсэн', value: counts.sent, color: '#3b82f6' },
    { name: 'Хүлээн авсан', value: counts.received, color: '#f59e0b' },
    { name: 'Бэлтгэж байгаа', value: counts.inProcess, color: '#f97316' },
    { name: 'Унаанд тавьсан', value: counts.transported, color: '#22c55e' },
  ]

  // Last 7 days bar chart
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      const next = new Date(d); next.setDate(d.getDate() + 1)
      const count = orders.filter((o) => {
        const t = new Date(o.createdAt).getTime()
        return t >= d.getTime() && t < next.getTime()
      }).length
      return {
        name: d.toLocaleDateString('mn-MN', { month: 'short', day: 'numeric' }),
        count,
      }
    })
  }, [orders])

  // Province breakdown
  const byProvince = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.forEach((o) => {
      map[o.province] = (map[o.province] ?? 0) + 1
    })
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
  }, [filtered])

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Хяналтын самбар</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Системийн ерөнхий байдал</p>
        </div>
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.days}
              onClick={() => setRange(opt.days)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                range === opt.days ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Нийт захиалга" value={counts.total} icon={ClipboardList} />
        <StatCard label="Илгээсэн" value={counts.sent} icon={Send} iconColor="text-blue-600" />
        <StatCard label="Бэлтгэж байгаа" value={counts.inProcess} icon={Package} iconColor="text-orange-600" />
        <StatCard label="Унаанд тавьсан" value={counts.transported} icon={Truck} iconColor="text-green-600" />
        <StatCard label="Хүлээн авсан" value={counts.received} icon={CheckCircle2} iconColor="text-amber-600" />
        <StatCard label="Идэвхтэй хэрэглэгч" value={counts.activeUsers} icon={Users} />
        <StatCard label="Өнөөдөр үүссэн" value={todayOrders} icon={Clock} />
        <StatCard label="Хожимдсон захиалга" value={delayed} icon={AlertTriangle} iconColor="text-red-600" />
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Status breakdown */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Төлөвөөр</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={statusChartData} barSize={28}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statusChartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Last 7 days */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">Сүүлийн 7 хоногийн захиалга</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={last7Days} barSize={20}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
                cursor={{ fill: 'var(--muted)' }}
              />
              <Bar dataKey="count" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Province breakdown + Recent orders */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Province */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-3">Аймгаар ({range === 1 ? 'Өнөөдөр' : `${range} хоног`})</h2>
          <div className="space-y-2.5">
            {byProvince.length === 0 && (
              <p className="text-sm text-muted-foreground">Мэдээлэл байхгүй</p>
            )}
            {byProvince.map(([province, count]) => (
              <div key={province} className="flex items-center gap-2">
                <span className="text-sm text-foreground flex-1">{province}</span>
                <div className="flex-1 bg-secondary rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (count / filtered.length) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-6 text-right tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="md:col-span-3 bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-foreground">Сүүлийн захиалгууд</h2>
            <Link href="/orders" className="text-xs text-primary hover:underline flex items-center gap-0.5">
              Бүгдийг харах <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/orders/${o.id}`}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{o.province} &middot; {o.moldCodes.length} загвар</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={o.status} size="sm" />
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
