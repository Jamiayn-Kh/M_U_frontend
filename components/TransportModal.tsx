'use client'

import { useState } from 'react'
import type { MoldOrder } from '@/types'
import { X, Truck } from 'lucide-react'

interface TransportData {
  departureDate: string
  departureTime: string
  busNumber: string
  driverPhone: string
  note?: string
}

interface Props {
  order: MoldOrder
  onConfirm: (info: TransportData) => Promise<void>
  onClose: () => void
}

export function TransportModal({ order, onConfirm, onClose }: Props) {
  const [departureDate, setDepartureDate] = useState('')
  const [departureTime, setDepartureTime] = useState('')
  const [busNumber, setBusNumber] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!departureDate) e.departureDate = 'Явах огноо оруулна уу'
    if (!departureTime) e.departureTime = 'Явах цаг оруулна уу'
    if (!busNumber.trim()) e.busNumber = 'Автобусны дугаар оруулна уу'
    if (!driverPhone.trim()) e.driverPhone = 'Жолоочийн утас оруулна уу'
    if (driverPhone.trim() && !/^[0-9]{8}$/.test(driverPhone.trim())) {
      e.driverPhone = 'Жолоочийн утас 8 оронтой байна'
    }
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    setLoading(true)
    try {
      await onConfirm({
        departureDate,
        departureTime,
        busNumber: busNumber.trim(),
        driverPhone: driverPhone.trim(),
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
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-sm">Унаанд тавих</h2>
              <p className="text-xs text-muted-foreground">#{order.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-3 bg-secondary/50 border-b border-border flex items-center gap-6 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Хэвний тоо</p>
            <p className="font-semibold text-foreground">{order.items.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Шигтгээтэй</p>
            <p className="font-semibold text-foreground">{order.items.filter(i => i.stoneRequired).length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Илгээгч</p>
            <p className="font-semibold text-foreground">{order.seller.fullName}</p>
          </div>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Явах огноо <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.departureDate ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.departureDate && <p className="text-xs text-red-600 mt-0.5">{errors.departureDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Явах цаг <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.departureTime ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.departureTime && <p className="text-xs text-red-600 mt-0.5">{errors.departureTime}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">
                Автобусны дугаар <span className="text-red-500">*</span>
              </label>
              <input
                value={busNumber}
                onChange={(e) => setBusNumber(e.target.value)}
                placeholder="1234 УБА"
                maxLength={50}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.busNumber ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.busNumber && <p className="text-xs text-red-600 mt-0.5">{errors.busNumber}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">
                Жолоочийн утасны дугаар <span className="text-red-500">*</span>
              </label>
              <input
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="99112233"
                type="tel"
                maxLength={8}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.driverPhone ? 'border-red-400 bg-red-50' : 'border-border bg-background'} text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.driverPhone && <p className="text-xs text-red-600 mt-0.5">{errors.driverPhone}</p>}
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">
                Нэмэлт тайлбар <span className="text-muted-foreground font-normal">(заавал биш)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Нэмэлт мэдэгдэл..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              />
            </div>
          </div>
        </div>

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
            Баталгаажуулах
          </button>
        </div>
      </div>
    </div>
  )
}
