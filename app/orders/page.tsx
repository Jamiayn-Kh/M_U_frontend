'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { StatusBadge } from '@/components/StatusBadge'
import { EmptyState } from '@/components/EmptyState'
import { getMoldOrders } from '@/services/api'
import { formatDate, formatDateTime } from '@/utils/formatters'
import { Search, Filter, X, ChevronLeft, ChevronRight, SlidersHorizontal, Download, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import type { MoldOrder, MoldOrderStatus } from '@/types'

const STATUSES: { value: MoldOrderStatus | ''; label: string }[] = [
  { value: '', label: 'Бүх статус' },
  { value: 'DRAFT', label: 'Ноорог' },
  { value: 'SENT', label: 'Илгээсэн' },
  { value: 'RECEIVED', label: 'Хот хүлээн авсан' },
  { value: 'IN_PROCESS', label: 'Цуглуулж байна' },
  { value: 'TRANSPORTED', label: 'Унаанд тавьсан' },
  { value: 'COMPLETED', label: 'Хүлээн авсан' },
  { value: 'CANCELLED', label: 'Цуцлагдсан' },
]

const PAGE_SIZE = 10

function LoadingSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-14 bg-secondary rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  const [orders, setOrders] = useState<MoldOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MoldOrderStatus | ''>((searchParams.get('status') as MoldOrderStatus) ?? '')
  const [sellerFilter, setSellerFilter] = useState('')
  const [handlerFilter, setHandlerFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    getMoldOrders()
      .then((data) => {
        setOrders(data)
        setError('')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = [...orders]

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          o.id.toString().includes(q) ||
          o.items.some((m) => m.moldCode.toLowerCase().includes(q)) ||
          o.seller.fullName.toLowerCase().includes(q) ||
          (o.cityHandler && o.cityHandler.fullName.toLowerCase().includes(q))
      )
    }
    if (statusFilter) list = list.filter((o) => o.status === statusFilter)
    if (sellerFilter) list = list.filter((o) => o.seller.fullName.toLowerCase().includes(sellerFilter.toLowerCase()))
    if (handlerFilter) list = list.filter((o) => o.cityHandler && o.cityHandler.fullName.toLowerCase().includes(handlerFilter.toLowerCase()))
    if (dateFrom) list = list.filter((o) => o.createdAt >= dateFrom)
    if (dateTo) list = list.filter((o) => o.createdAt <= dateTo + 'T23:59:59')

    if (sort === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    else list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    return list
  }, [orders, search, statusFilter, sellerFilter, handlerFilter, dateFrom, dateTo, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = !!(statusFilter || sellerFilter || handlerFilter || dateFrom || dateTo || search)

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setSellerFilter('')
    setHandlerFilter('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
  }

  function handleExportCSV() {
    const headers = ['ID', 'Борлуулагч', 'Хотын ажилтан', 'Загварын тоо', 'Нийт ширхэг', 'Шигтгээтэй', 'Статус', 'Огноо']
    const rows = filtered.map((o) => [
      o.id,
      o.seller.fullName,
      o.cityHandler?.fullName || '',
      o.items.length,
      o.items.reduce((sum, i) => sum + i.quantity, 0),
      o.items.filter(i => i.stoneRequired).length,
      o.status,
      formatDate(o.createdAt),
    ])
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const pageTitle = user?.role === 'CITY_HANDLER' ? 'Ирсэн захиалгууд' : user?.role === 'PROVINCE_SELLER' ? 'Миний захиалгууд' : 'Бүх захиалга'

  if (error) {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-semibold text-foreground mb-2">Алдаа гарлаа</p>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="text-primary hover:underline">Дахин оролдох</button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Нийт {filtered.length} захиалга
              {hasActiveFilters && ' (шүүлтүүр идэвхтэй)'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg bg-card hover:bg-secondary transition-colors text-foreground"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">CSV татах</span>
            </button>
            {user?.role === 'PROVINCE_SELLER' && (
              <Link
                href="/orders/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                + Шинэ захиалга
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="ID эсвэл загварын код хайх..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as MoldOrderStatus | ''); setPage(1) }}
                className="pl-3 pr-8 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                showFilters || (sellerFilter || handlerFilter || dateFrom || dateTo)
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-card text-foreground hover:bg-secondary'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Шүүлтүүр</span>
            </button>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="pl-3 pr-8 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="newest">Шинэ эхэнд</option>
                <option value="oldest">Хуучин эхэнд</option>
              </select>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="bg-card border border-border rounded-xl p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {user?.role === 'ADMIN' && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Борлуулагч</label>
                <input
                  value={sellerFilter}
                  onChange={(e) => { setSellerFilter(e.target.value); setPage(1) }}
                  placeholder="Нэрээр хайх"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
            )}
            {user?.role === 'ADMIN' && (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Хотын ажилтан</label>
                <input
                  value={handlerFilter}
                  onChange={(e) => { setHandlerFilter(e.target.value); setPage(1) }}
                  placeholder="Нэрээр хайх"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Огноо: -аас</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Огноо: -хүртэл</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-3.5 w-3.5" /> Шүүлтүүр арилгах
                </button>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <LoadingSkeleton />
        ) : paged.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? 'Тохирох захиалга олдсонгүй' : 'Захиалга байхгүй байна'}
            description={hasActiveFilters ? 'Шүүлтүүрийг өөрчлөн дахин хайна уу.' : 'Шинэ захиалга үүсгэх товчийг дарна уу.'}
          />
        ) : (
          <>
            <div className="hidden lg:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">ID</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Борлуулагч</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Хотын ажилтан</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Хэв / Ширхэг / Шигтгээ</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Статус</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Огноо</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paged.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-foreground">#{order.id}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground">{order.seller.fullName}</td>
                      <td className="px-4 py-3 text-foreground">{order.cityHandler?.fullName || '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-foreground font-medium">{order.items.length}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-foreground font-medium">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</span>
                        <span className="text-muted-foreground"> / </span>
                        <span className="text-foreground font-medium">{order.items.filter(i => i.stoneRequired).length}</span>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-xs text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Дэлгэрэнгүй
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="lg:hidden space-y-3">
              {paged.map((order) => (
                <Link key={order.id} href={`/orders/${order.id}`} className="block bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-sm font-semibold text-foreground">#{order.id}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Борлуулагч</span>
                      <p className="text-foreground font-medium truncate">{order.seller.fullName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Ажилтан</span>
                      <p className="text-foreground font-medium truncate">{order.cityHandler?.fullName || '—'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Хэв / Ширхэг</span>
                      <p className="text-foreground">{order.items.length} / {order.items.reduce((sum, i) => sum + i.quantity, 0)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Шигтгээтэй</span>
                      <p className="text-foreground">{order.items.filter(i => i.stoneRequired).length}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{formatDateTime(order.createdAt)}</p>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-muted-foreground">
                  {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} / {filtered.length}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = totalPages <= 5 ? i + 1 : Math.max(1, Math.min(totalPages - 4, page - 2)) + i
                    return (
                      <button
                        key={pg}
                        onClick={() => setPage(pg)}
                        className={`h-8 w-8 text-sm rounded-lg border transition-colors ${
                          pg === page
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-card hover:bg-secondary text-foreground'
                        }`}
                      >
                        {pg}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-8 w-8 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-secondary disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      
    </div>
  )
}
