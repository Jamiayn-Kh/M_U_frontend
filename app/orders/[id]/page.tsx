'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppLayout } from '@/components/AppLayout'
import { StatusBadge } from '@/components/StatusBadge'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TransportModal } from '@/components/TransportModal'
import {
  getMoldOrderById,
  receiveMoldOrder,
  processMoldOrder,
  transportMoldOrder,
  completeMoldOrder,
} from '@/services/api'
import { formatDate, formatDateTime } from '@/utils/formatters'
import {
  ChevronRight,
  User,
  Calendar,
  Hash,
  Info,
  Truck,
  CheckCircle,
  Package,
  MessageSquare,
} from 'lucide-react'
import Link from 'next/link'
import type { MoldOrder } from '@/types'

interface Props { params: Promise<{ id: string }> }

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()

  const [order, setOrder] = useState<MoldOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  const [confirmReceive, setConfirmReceive] = useState(false)
  const [confirmProcess, setConfirmProcess] = useState(false)
  const [confirmComplete, setConfirmComplete] = useState(false)
  const [showTransport, setShowTransport] = useState(false)

  useEffect(() => {
    setLoading(true)
    getMoldOrderById(Number(id))
      .then((o) => {
        setOrder(o)
        setError('')
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
      })
      .finally(() => setLoading(false))
  }, [id])

  async function handleReceive() {
    if (!order) return
    setActionLoading(true)
    setActionError('')
    try {
      const updated = await receiveMoldOrder(order.id)
      setOrder(updated)
      setConfirmReceive(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleProcess() {
    if (!order) return
    setActionLoading(true)
    setActionError('')
    try {
      const updated = await processMoldOrder(order.id)
      setOrder(updated)
      setConfirmProcess(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleTransport(data: { departureDate: string; departureTime: string; busNumber: string; driverPhone: string; note?: string }) {
    if (!order) return
    setActionError('')
    try {
      const updated = await transportMoldOrder(order.id, data)
      setOrder(updated)
      setShowTransport(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    }
  }

  async function handleComplete() {
    if (!order) return
    setActionLoading(true)
    setActionError('')
    try {
      const updated = await completeMoldOrder(order.id)
      setOrder(updated)
      setConfirmComplete(false)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-secondary rounded-lg" />
          <div className="h-24 bg-secondary rounded-xl" />
          <div className="h-48 bg-secondary rounded-xl" />
        </div>
      </AppLayout>
    )
  }

  if (error || !order) {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <p className="text-xl font-semibold text-foreground mb-2">
            {error || 'Захиалга олдсонгүй'}
          </p>
          <Link href="/orders" className="text-primary hover:underline text-sm">← Буцах</Link>
        </div>
      </AppLayout>
    )
  }

  const isSeller = user?.role === 'PROVINCE_SELLER' && user.id === order.seller.id
  const isHandler = user?.role === 'CITY_HANDLER' && order.cityHandler && user.id === order.cityHandler.id
  const isAdmin = user?.role === 'ADMIN'

  const canReceive = isHandler && order.status === 'SENT'
  const canProcess = isHandler && order.status === 'RECEIVED'
  const canTransport = isHandler && order.status === 'IN_PROCESS'
  const canComplete = isSeller && order.status === 'TRANSPORTED'

  const stoneRequiredCount = order.items.filter(i => i.stoneRequired).length

  return (
    <AppLayout>
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5">
        <Link href="/orders" className="hover:text-foreground transition-colors">Захиалгууд</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium font-mono">#{order.id}</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground font-mono">#{order.id}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Үүсгэсэн: {formatDateTime(order.createdAt)}</p>
            {order.receivedAt && (
              <p className="text-sm text-muted-foreground">Хүлээн авсан: {formatDateTime(order.receivedAt)}</p>
            )}
            {order.transportedAt && (
              <p className="text-sm text-muted-foreground">Унаанд тавьсан: {formatDateTime(order.transportedAt)}</p>
            )}
            {order.completedAt && (
              <p className="text-sm text-muted-foreground">Дууссан: {formatDateTime(order.completedAt)}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {canReceive && (
              <button
                onClick={() => setConfirmReceive(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
              >
                <CheckCircle className="h-4 w-4" /> Хүлээн авсан
              </button>
            )}
            {canProcess && (
              <button
                onClick={() => setConfirmProcess(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <Package className="h-4 w-4" /> Цуглуулж эхлэх
              </button>
            )}
            {canTransport && (
              <button
                onClick={() => setShowTransport(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Truck className="h-4 w-4" /> Унаанд тавих
              </button>
            )}
            {canComplete && (
              <button
                onClick={() => setConfirmComplete(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium"
              >
                <CheckCircle className="h-4 w-4" /> Хүлээн авсан
              </button>
            )}
          </div>
        </div>

        {actionError && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {actionError}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">Захиалгын мэдээлэл</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Аймгийн борлуулагч</p>
                    <p className="font-medium text-foreground">{order.seller.fullName}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Хотын ажилтан</p>
                    <p className="font-medium text-foreground">{order.cityHandler?.fullName || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Хэвний кодууд</h2>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{order.items.length} хэв</span>
                {stoneRequiredCount > 0 && <span>{stoneRequiredCount} шигтгээтэй</span>}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">#</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Код</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Prefix</th>
                    <th className="text-center px-4 py-2.5 text-xs text-muted-foreground font-medium">Шигтгээ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.items.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-semibold text-foreground">{item.moldCode}</span>
                      </td>
                      <td className="px-4 py-2.5 text-foreground">{item.codePrefix}</td>
                      <td className="px-4 py-2.5 text-center">
                        {item.stoneRequired ? (
                          <span className="text-green-600 text-xs">✓</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {order.note && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-start gap-2.5">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Тайлбар</p>
                  <p className="text-sm text-foreground">{order.note}</p>
                </div>
              </div>
            </div>
          )}

          {(order.transport.departureDate || order.transport.busNumber) && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Тээврийн мэдээлэл</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {order.transport.busNumber && (
                  <div>
                    <p className="text-xs text-muted-foreground">Автобусны дугаар</p>
                    <p className="font-medium text-foreground">{order.transport.busNumber}</p>
                  </div>
                )}
                {order.transport.driverPhone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Жолоочийн утас</p>
                    <p className="font-medium text-foreground">{order.transport.driverPhone}</p>
                  </div>
                )}
                {order.transport.departureDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Явах огноо</p>
                    <p className="font-medium text-foreground">{order.transport.departureDate}</p>
                  </div>
                )}
                {order.transport.departureTime && (
                  <div>
                    <p className="text-xs text-muted-foreground">Явах цаг</p>
                    <p className="font-medium text-foreground">{order.transport.departureTime}</p>
                  </div>
                )}
                {order.transport.note && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Тайлбар</p>
                    <p className="font-medium text-foreground">{order.transport.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-secondary rounded-xl p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground text-sm mb-2">Статус</p>
            <div className="space-y-2">
              {order.sentAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Илгээсэн: {formatDate(order.sentAt)}</span>
                </div>
              )}
              {order.receivedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Хүлээн авсан: {formatDate(order.receivedAt)}</span>
                </div>
              )}
              {order.transportedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Унаанд тавьсан: {formatDate(order.transportedAt)}</span>
                </div>
              )}
              {order.completedAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Дууссан: {formatDate(order.completedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReceive}
        title="Захиалга хүлээн авсан уу?"
        description="Энэ захиалгыг хүлээн авсан гэж тэмдэглэхэд статус 'Хот хүлээн авсан' болно."
        confirmLabel="Хүлээн авсан"
        loading={actionLoading}
        onConfirm={handleReceive}
        onCancel={() => setConfirmReceive(false)}
      />
      <ConfirmDialog
        open={confirmProcess}
        title="Цуглуулж эхлүүлэх үү?"
        description="Захиалгын статус 'Цуглуулж байна' болно."
        confirmLabel="Цуглуулж эхлэх"
        loading={actionLoading}
        onConfirm={handleProcess}
        onCancel={() => setConfirmProcess(false)}
      />
      <ConfirmDialog
        open={confirmComplete}
        title="Хэв хүлээн авсан уу?"
        description="Захиалга дууссан гэж тэмдэглэгдэнэ."
        confirmLabel="Хүлээн авсан"
        loading={actionLoading}
        onConfirm={handleComplete}
        onCancel={() => setConfirmComplete(false)}
      />

      {showTransport && (
        <TransportModal
          order={order}
          onConfirm={handleTransport}
          onClose={() => setShowTransport(false)}
        />
      )}
    </AppLayout>
  )
}
