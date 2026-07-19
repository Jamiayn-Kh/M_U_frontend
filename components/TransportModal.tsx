'use client'

import { useState } from 'react'
import type { TransportInfo, MoldOrder } from '@/types'
import { totalQuantity } from '@/utils/formatters'
import { X, Truck } from 'lucide-react'

interface Props {
  order: MoldOrder
  onConfirm: (info: TransportInfo) => Promise<void>
  onClose: () => void
}

export function TransportModal({ order, onConfirm, onClose }: Props) {
  const [station, setStation] = useState('')
  const [vehicle, setVehicle] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!station.trim()) e.station = 'Тээврийн газар оруулна уу'
    if (!vehicle.trim()) e.vehicle = 'Тэргэнцрийн дугаар оруулна уу'
    if (!phone.trim()) e.phone = 'Жолоочийн утасны дугаар оруулна уу'
    if (!date) e.date = 'Явах огноо оруулна уу'
    if (!time) e.time = 'Явах цаг оруулна уу'
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    try {
      await onConfirm({
        transportStation: station.trim(),
        vehicleNumber: vehicle.trim().toUpperCase(),
        driverPhone: phone.trim(),
        departureDate: date,
        departureTime: time,
        note: note.trim() || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Унаанд тавих</h2>
              <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Order summary */}
        <div className="px-5 py-3 bg-secondary/50 border-b border-border flex items-center gap-6 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Загварын тоо</p>
            <p className="font-semibold text-foreground">{order.moldCodes.length} загвар</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Нийт ширхэг</p>
            <p className="font-semibold text-foreground">{totalQuantity(order.moldCodes)} ш</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Илгээгч</p>
            <p className="font-semibold text-foreground">{order.provinceSellerName}</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">
                Тээврийн газар <span className="text-red-500">*</span>
              </label>
              <input
                value={station}
                onChange={(e) => setStation(e.target.value)}
                placeholder="Жишээ: Эрчим тээвэр"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.station ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.station && <p className="text-xs text-red-600 mt-0.5">{errors.station}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Тэргэнцрийн дугаар <span className="text-red-500">*</span>
              </label>
              <input
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value.toUpperCase())}
                placeholder="УНА-1234"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.vehicle ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.vehicle && <p className="text-xs text-red-600 mt-0.5">{errors.vehicle}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Жолоочийн утас <span className="text-red-500">*</span>
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9900-0000"
                type="tel"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.phone ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.phone && <p className="text-xs text-red-600 mt-0.5">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Явах огноо <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.date ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.date && <p className="text-xs text-red-600 mt-0.5">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Явах цаг <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.time ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.time && <p className="text-xs text-red-600 mt-0.5">{errors.time}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">
                Нэмэлт тайлбар <span className="text-muted-foreground font-normal">(заавал биш)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Нэмэлт мэдэгдэл..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 px-5 py-4 border-t border-border bg-secondary/30">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-60"
          >
            Болих
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading && <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />}
            Унаанд тавьсан гэж баталгаажуулах
          </button>
        </div>
      </div>
    </div>
  )
}
