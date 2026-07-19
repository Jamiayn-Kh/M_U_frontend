'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AppLayout } from '@/components/AppLayout'
import { EmptyState } from '@/components/EmptyState'
import { getActivityLogs } from '@/services/api'
import { roleLabel, formatDateTime } from '@/utils/formatters'
import { Search, X, Shield, Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { ActivityLog } from '@/types'

export default function ActivityPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    setLoading(true)
    getActivityLogs().then((l) => { setLogs(l); setLoading(false) })
  }, [])

  const allActions = useMemo(() => {
    const set = new Set(logs.map((l) => l.action))
    return Array.from(set).sort()
  }, [logs])

  const allUsers = useMemo(() => {
    const map = new Map<string, string>()
    logs.forEach((l) => map.set(l.userId, l.userName))
    return Array.from(map.entries())
  }, [logs])

  const filtered = useMemo(() => {
    let list = [...logs]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (l) =>
          l.userName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.orderNumber ?? '').toLowerCase().includes(q)
      )
    }
    if (userFilter) list = list.filter((l) => l.userId === userFilter)
    if (actionFilter) list = list.filter((l) => l.action === actionFilter)
    if (dateFrom) list = list.filter((l) => l.createdAt >= dateFrom)
    if (dateTo) list = list.filter((l) => l.createdAt <= dateTo + 'T23:59:59')
    return list
  }, [logs, search, userFilter, actionFilter, dateFrom, dateTo])

  if (user?.role !== 'ADMIN') {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground">Хандах эрх байхгүй</p>
          <p className="text-muted-foreground text-sm mt-1">Энэ хуудас зөвхөн администраторт харагдана.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Үйл ажиллагааны түүх</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Нийт {filtered.length} үйлдэл</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэр, үйлдэл, захиалга..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div className="relative">
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">Бүх хэрэглэгч</option>
              {allUsers.map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div className="relative">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50"
            >
              <option value="">Бүх үйлдэл</option>
              {allActions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="flex-1 px-2 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="flex-1 px-2 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          {(search || userFilter || actionFilter || dateFrom || dateTo) && (
            <button
              onClick={() => { setSearch(''); setUserFilter(''); setActionFilter(''); setDateFrom(''); setDateTo('') }}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Шүүлтүүр арилгах
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-14 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Үйлдэл олдсонгүй" description="Шүүлтүүрийг өөрчлөн дахин хайна уу." />
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm hidden md:table">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Огноо цаг</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Хэрэглэгч</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Үүрэг</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Үйлдэл</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Захиалга</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Өөрчлөлт</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">{roleLabel(log.userRole)}</span>
                    </td>
                    <td className="px-4 py-3 text-foreground">{log.action}</td>
                    <td className="px-4 py-3">
                      {log.orderNumber ? (
                        <Link href={`/orders/${log.orderId}`} className="font-mono text-xs text-primary hover:underline">
                          {log.orderNumber}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {(log.previousValue || log.newValue) ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {log.previousValue && <span className="bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{log.previousValue}</span>}
                          {log.previousValue && log.newValue && <ArrowRight className="h-3 w-3" />}
                          {log.newValue && <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{log.newValue}</span>}
                        </div>
                      ) : log.note ? <span className="text-xs text-muted-foreground">{log.note}</span> : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-border">
              {filtered.map((log) => (
                <div key={log.id} className="px-4 py-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-foreground text-sm">{log.userName}</span>
                      <span className="text-muted-foreground text-xs ml-2">· {roleLabel(log.userRole)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
                  </div>
                  <p className="text-sm text-foreground">{log.action}</p>
                  {log.orderNumber && (
                    <Link href={`/orders/${log.orderId}`} className="text-xs font-mono text-primary hover:underline">
                      {log.orderNumber}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
