'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppLayout } from '@/components/AppLayout'
import { StatusBadge } from '@/components/StatusBadge'
import { OrderTimeline } from '@/components/OrderTimeline'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TransportModal } from '@/components/TransportModal'
import { useToast } from '@/components/Toast'
import {
  confirmOrderReceived,
  startOrderProcessing,
  markOrderTransported,
  cancelOrder,
  getOrderById,
} from '@/services/api'
import { formatDate, formatDateTime, totalQuantity } from '@/utils/formatters'
import {
  ArrowLeft, CheckCircle, Package, Truck, XCircle,
  User, MapPin, MessageSquare, Calendar, Hash,
  Info, ChevronRight,
} from 'lucide-react'
import Link from 'next/link'
import type { MoldOrder, TransportInfo } from '@/types'

interface Props { params: Promise<{ id: string }> }

export default function OrderDetailPage({ params }: Props) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const [order, setOrder] = useState<MoldOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [confirmReceive, setConfirmReceive] = useState(false)
  const [confirmProcess, setConfirmProcess] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [showTransport, setShowTransport] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [handlerNote, setHandlerNote] = useState('')

  useEffect(() => {
    setLoading(true)
    getOrderById(id).then((o) => {
      if (!o) setNotFound(true)
      else { setOrder(o); setHandlerNote(o.cityHandlerNote ?? '') }
      setLoading(false)
    })
  }, [id])

  async function handleReceive() {
    if (!user || !order) return
    setActionLoading(true)
    try {
      const updated = await confirmOrderReceived(order.id, user)
      setOrder(updated)
      toast.success('Хүлээн авсан гэж тэмдэглэгдлээ')
    } catch (e) {
      toast.error('Алдаа гарлаа', e instanceof Error ? e.message : undefined)
    } finally {
      setActionLoading(false)
      setConfirmReceive(false)
    }
  }

  async function handleProcess() {
    if (!user || !order) return
    setActionLoading(true)
    try {
      const updated = await startOrderProcessing(order.id, user, handlerNote || undefined)
      setOrder(updated)
      toast.success('Бэлтгэлт эхэлсэн гэж тэмдэглэгдлээ')
    } catch (e) {
      toast.error('Алдаа гарлаа', e instanceof Error ? e.message : undefined)
    } finally {
      setActionLoading(false)
      setConfirmProcess(false)
    }
  }

  async function handleTransport(info: TransportInfo) {
    if (!user || !order) return
    try {
      const updated = await markOrderTransported(order.id, user, info)
      setOrder(updated)
      toast.success('Унаанд тавьсан гэж баталгаажуулагдлаа')
      setShowTransport(false)
    } catch (e) {
      toast.error('Алдаа гарлаа', e instanceof Error ? e.message : undefined)
    }
  }

  async function handleCancel() {
    if (!user || !order) return
    setActionLoading(true)
    try {
      const updated = await cancelOrder(order.id, user)
      setOrder(updated)
      toast.success('Захиалга цуцлагдлаа')
    } catch (e) {
      toast.error('Алдаа гарлаа', e instanceof Error ? e.message : undefined)
    } finally {
      setActionLoading(false)
      setConfirmCancel(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-secondary rounded-lg" />
          <div className="h-24 bg-secondary rounded-xl" />
          <div className="h-48 bg-secondary rounded-xl" />
          <div className="h-64 bg-secondary rounded-xl" />
        </div>
      </AppLayout>
    )
  }

  if (notFound || !order) {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <p className="text-2xl font-semibold text-foreground mb-2">Захиалга олдсонгүй</p>
          <p className="text-muted-foreground mb-6">Энэ захиалга устгагдсан эсвэл та эрх байхгүй байж болно.</p>
          <Link href="/orders" className="text-primary hover:underline text-sm">← Буцах</Link>
        </div>
      </AppLayout>
    )
  }

  const isSeller = user?.role === 'PROVINCE_SELLER' && user.id === order.provinceSellerId
  const isHandler = user?.role === 'CITY_HANDLER' && user.id === order.cityHandlerId
  const isAdmin = user?.role === 'ADMIN'

  const canCancel = isSeller && order.status === 'SENT'
  const canReceive = isHandler && order.status === 'SENT'
  const canProcess = isHandler && order.status === 'RECEIVED'
  const canTransport = isHandler && order.status === 'IN_PROCESS'

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-5">
        <Link href="/orders" className="hover:text-foreground transition-colors">Захиалгууд</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium font-mono">{order.orderNumber}</span>
      </div>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-sm mb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground font-mono">{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">Үүсгэсэн: {formatDateTime(order.createdAt)}</p>
            {order.receivedAt && (
              <p className="text-sm text-muted-foreground">Хүлээн авсан: {formatDateTime(order.receivedAt)}</p>
            )}
            {order.transportedAt && (
              <p className="text-sm text-muted-foreground">Унаанд тавьсан: {formatDateTime(order.transportedAt)}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {canCancel && (
              <button
                onClick={() => setConfirmCancel(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                <XCircle className="h-4 w-4 text-red-500" /> Цуцлах
              </button>
            )}
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
                <Package className="h-4 w-4" /> Бэлтгэж эхлэх
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
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left column — main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Seller & handler info */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">Захиалгын мэдээлэл</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Аймгийн борлуулагч</p>
                    <p className="font-medium text-foreground">{order.provinceSellerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Аймаг</p>
                    <p className="font-medium text-foreground">{order.province}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Хотын ажилтан</p>
                    <p className="font-medium text-foreground">{order.cityHandlerName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Сүүлд шинэчлэгдсэн</p>
                    <p className="font-medium text-foreground">{formatDateTime(order.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mold codes */}
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Загварын кодууд</h2>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{order.moldCodes.length} загвар</span>
                <span>{totalQuantity(order.moldCodes)} ширхэг</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border">
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">#</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Загварын код</th>
                    <th className="text-right px-4 py-2.5 text-xs text-muted-foreground font-medium">Тоо</th>
                    <th className="text-left px-4 py-2.5 text-xs text-muted-foreground font-medium">Тэмдэглэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {order.moldCodes.map((mc, idx) => (
                    <tr key={mc.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{idx + 1}</td>
                      <td className="px-4 py-2.5">
                        <span className="font-mono font-semibold text-foreground">{mc.code}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium tabular-nums text-foreground">{mc.quantity}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{mc.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-secondary/50 border-t border-border">
                    <td colSpan={2} className="px-4 py-2.5 text-xs font-semibold text-foreground">Нийт</td>
                    <td className="px-4 py-2.5 text-right font-semibold tabular-nums text-foreground">{totalQuantity(order.moldCodes)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes */}
          {(order.sellerNote || order.cityHandlerNote || (isHandler && order.status !== 'CANCELLED' && order.status !== 'DRAFT')) && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-foreground">Тэмдэглэлүүд</h2>
              {order.sellerNote && (
                <div className="flex items-start gap-2.5">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Борлуулагчийн тайлбар</p>
                    <p className="text-sm text-foreground">{order.sellerNote}</p>
                  </div>
                </div>
              )}
              {order.cityHandlerNote && (
                <div className="flex items-start gap-2.5">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Хотын ажилтны тайлбар</p>
                    <p className="text-sm text-foreground">{order.cityHandlerNote}</p>
                  </div>
                </div>
              )}
              {/* Handler note input for in-process step */}
              {isHandler && order.status === 'RECEIVED' && (
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Боловсруулалтын тэмдэглэл <span className="text-muted-foreground font-normal">(заавал биш)</span>
                  </label>
                  <textarea
                    value={handlerNote}
                    onChange={(e) => setHandlerNote(e.target.value)}
                    rows={2}
                    placeholder="Бэлтгэлтэй холбоотой тэмдэглэл..."
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Transport info */}
          {order.transportInfo && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Тээврийн мэдээлэл</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Тээврийн газар', value: order.transportInfo.transportStation },
                  { label: 'Тэргэнцрийн дугаар', value: order.transportInfo.vehicleNumber },
                  { label: 'Жолоочийн утас', value: order.transportInfo.driverPhone },
                  { label: 'Явах огноо', value: formatDate(order.transportInfo.departureDate) },
                  { label: 'Явах цаг', value: order.transportInfo.departureTime },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="font-medium text-foreground">{item.value}</p>
                  </div>
                ))}
                {order.transportInfo.note && (
                  <div className="sm:col-span-2">
                    <p className="text-xs text-muted-foreground">Тайлбар</p>
                    <p className="font-medium text-foreground">{order.transportInfo.note}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column — timeline */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-foreground mb-4">Статусын түүх</h2>
            <OrderTimeline history={order.statusHistory} />
          </div>

          {/* Audit info */}
          <div className="bg-secondary rounded-xl p-4 text-xs text-muted-foreground space-y-1.5">
            <p className="font-medium text-foreground text-sm mb-2">Аудитын мэдээлэл</p>
            <div className="flex items-center gap-2">
              <Hash className="h-3.5 w-3.5" />
              <span>ID: {order.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" />
              <span>Үүсгэсэн: {formatDateTime(order.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-3.5 w-3.5" />
              <span>Шинэчлэгдсэн: {formatDateTime(order.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={confirmReceive}
        title="Захиалга хүлээн авсан уу?"
        description="Энэ захиалгыг хүлээн авсан гэж тэмдэглэхэд статус 'Хүлээн авсан' болно."
        confirmLabel="Хүлээн авсан"
        loading={actionLoading}
        onConfirm={handleReceive}
        onCancel={() => setConfirmReceive(false)}
      />
      <ConfirmDialog
        open={confirmProcess}
        title="Бэлтгэлт эхлүүлэх үү?"
        description="Захиалгын статус 'Бэлтгэж байгаа' болж мэдэгдэл илгээгдэнэ."
        confirmLabel="Бэлтгэж эхлэх"
        loading={actionLoading}
        onConfirm={handleProcess}
        onCancel={() => setConfirmProcess(false)}
      />
      <ConfirmDialog
        open={confirmCancel}
        title="Захиалга цуцлах уу?"
        description="Энэ үйлдлийг буцаах боломжгүй. Захиалга цуцлагдсан статустай болно."
        confirmLabel="Цуцлах"
        variant="destructive"
        loading={actionLoading}
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
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
