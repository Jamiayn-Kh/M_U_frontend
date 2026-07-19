'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getStoredUsers } from '@/lib/store'
import { createOrder } from '@/services/api'
import { useToast } from '@/components/Toast'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { Plus, Trash2, AlertCircle, ChevronDown, Upload } from 'lucide-react'
import type { MoldCodeItem } from '@/types'
import { generateId } from '@/lib/store'

interface MoldRow extends Omit<MoldCodeItem, 'id'> {
  id: string
  _error?: string
}

function emptyRow(): MoldRow {
  return { id: generateId('mc'), code: '', quantity: 1, note: '' }
}

export default function NewOrderPage() {
  const router = useRouter()
  const { user } = useAuth()
  const toast = useToast()

  const cityHandlers = getStoredUsers().filter((u) => u.role === 'CITY_HANDLER' && u.active)

  const [cityHandlerId, setCityHandlerId] = useState('')
  const [sellerNote, setSellerNote] = useState('')
  const [rows, setRows] = useState<MoldRow[]>([emptyRow()])
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [loading, setLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  const [bulkInput, setBulkInput] = useState('')
  const [showBulk, setShowBulk] = useState(false)

  const selectedHandler = cityHandlers.find((h) => h.id === cityHandlerId)

  function updateRow(id: string, field: keyof MoldRow, value: string | number) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const updated = { ...r, [field]: value }
        if (field === 'code') {
          const code = (value as string).trim().toUpperCase()
          updated.code = code
          // Check duplicate
          const dupe = prev.some((other) => other.id !== id && other.code === code && code !== '')
          updated._error = dupe ? 'Давхардсан код' : undefined
        }
        return updated
      })
    )
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow()])
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)))
  }

  function handleBulkPaste() {
    const codes = bulkInput
      .split(/[,\n]+/)
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean)
    const newRows: MoldRow[] = codes.map((code) => ({ id: generateId('mc'), code, quantity: 1, note: '' }))
    setRows((prev) => {
      const existing = prev.filter((r) => r.code !== '')
      return [...existing, ...newRows]
    })
    setBulkInput('')
    setShowBulk(false)
  }

  function validateStep1() {
    if (!cityHandlerId) return 'Хотын ажилтаныг сонгоно уу'
    return null
  }

  function validateStep2() {
    const errors: string[] = []
    rows.forEach((r, i) => {
      if (!r.code.trim()) errors.push(`${i + 1}-р мөр: Загварын код хоосон байна`)
      if (r.quantity < 1) errors.push(`${i + 1}-р мөр: Тоо хэмжээ 0-ээс их байна`)
      if (r._error) errors.push(`${i + 1}-р мөр: ${r._error}`)
    })
    return errors.length > 0 ? errors[0] : null
  }

  async function handleSubmit(draft: boolean) {
    if (!user || !selectedHandler) return
    setLoading(true)
    setConfirmOpen(false)
    try {
      const validRows = rows.filter((r) => r.code.trim())
      const moldCodes: MoldCodeItem[] = validRows.map((r) => ({
        id: r.id,
        code: r.code.trim().toUpperCase(),
        quantity: r.quantity,
        note: r.note?.trim(),
      }))
      const order = await createOrder({
        cityHandlerId,
        cityHandlerName: selectedHandler.fullName,
        moldCodes,
        sellerNote: sellerNote.trim() || undefined,
        isDraft: draft,
        currentUser: user,
      })
      toast.success(
        draft ? 'Ноорог хадгалагдлаа' : 'Захиалга амжилттай илгээгдлээ',
        draft ? undefined : `Захиалгын дугаар: ${order.orderNumber}`
      )
      router.push(`/orders/${order.id}`)
    } catch (err) {
      toast.error('Алдаа гарлаа', err instanceof Error ? err.message : undefined)
    } finally {
      setLoading(false)
    }
  }

  const totalQuantityCalc = rows.reduce((s, r) => s + (r.quantity || 0), 0)
  const uniqueCodes = new Set(rows.map((r) => r.code).filter(Boolean)).size

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Шинэ захиалга үүсгэх</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Загварын захиалга бөглөж хотын ажилтанд илгээнэ</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: 'Ерөнхий мэдээлэл' },
          { n: 2, label: 'Загварын кодууд' },
          { n: 3, label: 'Баталгаажуулалт' },
        ].map(({ n, label }, idx) => (
          <div key={n} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (n < step) setStep(n as 1 | 2 | 3)
                else if (n === 2 && step === 1) {
                  const err = validateStep1()
                  if (err) { toast.error(err); return }
                  setStep(2)
                } else if (n === 3 && step === 2) {
                  const err = validateStep2()
                  if (err) { toast.error(err); return }
                  setStep(3)
                }
              }}
              className={`flex items-center gap-2 text-sm ${n <= step ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              <span
                className={`h-6 w-6 rounded-full text-xs font-semibold flex items-center justify-center transition-colors ${
                  n === step
                    ? 'bg-primary text-primary-foreground'
                    : n < step
                    ? 'bg-green-500 text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {n < step ? '✓' : n}
              </span>
              <span className="hidden sm:block">{label}</span>
            </button>
            {idx < 2 && <div className="h-px w-6 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: General info */}
      {step === 1 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <h2 className="font-semibold text-foreground text-sm">Ерөнхий мэдээлэл</h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Аймгийн борлуулагч</label>
              <input
                value={user?.fullName ?? ''}
                disabled
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-secondary text-muted-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Аймаг</label>
              <input
                value={user?.province ?? ''}
                disabled
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-secondary text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Хотын ажилтан <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={cityHandlerId}
                onChange={(e) => setCityHandlerId(e.target.value)}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50"
              >
                <option value="">— Сонгоно уу —</option>
                {cityHandlers.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.fullName} ({h.organizationName})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Нэмэлт тайлбар <span className="text-muted-foreground font-normal">(заавал биш)</span>
            </label>
            <textarea
              value={sellerNote}
              onChange={(e) => setSellerNote(e.target.value)}
              rows={3}
              placeholder="Захиалгатай холбоотой нэмэлт мэдээлэл..."
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                const err = validateStep1()
                if (err) { toast.error(err); return }
                setStep(2)
              }}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Үргэлжлүүлэх →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Mold codes */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Загварын кодууд</h2>
            <button
              onClick={() => setShowBulk((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Upload className="h-3.5 w-3.5" />
              Олон код нэгэн зэрэг оруулах
            </button>
          </div>

          {showBulk && (
            <div className="bg-secondary rounded-lg p-3 space-y-2">
              <p className="text-xs text-muted-foreground">Таслал эсвэл мөр хоорондоор тусгаарлаж оруулна уу:</p>
              <textarea
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                rows={3}
                placeholder="EM-1042, BG-2201&#10;MN-0875"
                className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowBulk(false)} className="text-xs text-muted-foreground hover:text-foreground">Болих</button>
                <button
                  onClick={handleBulkPaste}
                  className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                >
                  Нэмэх
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
              <span className="col-span-1">#</span>
              <span className="col-span-4">Загварын код *</span>
              <span className="col-span-2">Тоо *</span>
              <span className="col-span-4">Тэмдэглэл</span>
              <span className="col-span-1" />
            </div>

            {rows.map((row, idx) => (
              <div key={row.id} className="grid grid-cols-12 gap-2 items-start">
                <span className="col-span-1 text-sm text-muted-foreground pt-2.5">{idx + 1}</span>
                <div className="col-span-4">
                  <input
                    value={row.code}
                    onChange={(e) => updateRow(row.id, 'code', e.target.value.toUpperCase())}
                    placeholder="EM-1042"
                    className={`w-full px-2.5 py-2 text-sm rounded-lg border ${
                      row._error ? 'border-red-400 bg-red-50' : 'border-border bg-card'
                    } text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
                  />
                  {row._error && <p className="text-xs text-red-600 mt-0.5">{row._error}</p>}
                </div>
                <div className="col-span-2">
                  <input
                    type="number"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="col-span-4">
                  <input
                    value={row.note ?? ''}
                    onChange={(e) => updateRow(row.id, 'note', e.target.value)}
                    placeholder="Тэмдэглэл..."
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="col-span-1 flex justify-center pt-2">
                  <button
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length === 1}
                    className="text-muted-foreground hover:text-red-500 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={addRow}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Мөр нэмэх
          </button>

          {/* Summary */}
          <div className="bg-secondary rounded-lg px-4 py-3 flex gap-6 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Нийт загварын тоо</p>
              <p className="font-semibold text-foreground tabular-nums">{uniqueCodes}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Нийт тоо хэмжээ</p>
              <p className="font-semibold text-foreground tabular-nums">{totalQuantityCalc}</p>
            </div>
          </div>

          <div className="flex justify-between">
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Буцах
            </button>
            <button
              onClick={() => {
                const err = validateStep2()
                if (err) { toast.error(err); return }
                setStep(3)
              }}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              Үргэлжлүүлэх →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
          <h2 className="font-semibold text-foreground text-sm">Захиалгын товч мэдээлэл</h2>

          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Борлуулагч</p>
                <p className="font-medium text-foreground">{user?.fullName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Аймаг</p>
                <p className="font-medium text-foreground">{user?.province}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Хотын ажилтан</p>
                <p className="font-medium text-foreground">{selectedHandler?.fullName}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Загварын тоо</p>
                <p className="font-medium text-foreground tabular-nums">{uniqueCodes} загвар</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Нийт тоо хэмжээ</p>
                <p className="font-medium text-foreground tabular-nums">{totalQuantityCalc} ширхэг</p>
              </div>
              {sellerNote && (
                <div>
                  <p className="text-xs text-muted-foreground">Тайлбар</p>
                  <p className="text-foreground">{sellerNote}</p>
                </div>
              )}
            </div>
          </div>

          {/* Code list preview */}
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary text-left">
                  <th className="px-3 py-2 text-xs text-muted-foreground font-medium">#</th>
                  <th className="px-3 py-2 text-xs text-muted-foreground font-medium">Код</th>
                  <th className="px-3 py-2 text-xs text-muted-foreground font-medium">Тоо</th>
                  <th className="px-3 py-2 text-xs text-muted-foreground font-medium">Тэмдэглэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.filter((r) => r.code.trim()).map((row, idx) => (
                  <tr key={row.id}>
                    <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2 font-mono font-medium text-foreground">{row.code}</td>
                    <td className="px-3 py-2 text-foreground tabular-nums">{row.quantity}</td>
                    <td className="px-3 py-2 text-muted-foreground">{row.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <button onClick={() => setStep(2)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Буцах
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => { setIsDraft(true); setConfirmOpen(true) }}
                className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-secondary transition-colors text-foreground"
              >
                Ноорог хадгалах
              </button>
              <button
                onClick={() => { setIsDraft(false); setConfirmOpen(true) }}
                className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Захиалга илгээх
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={isDraft ? 'Ноорог хадгалах уу?' : 'Захиалга илгээх үү?'}
        description={
          isDraft
            ? 'Захиалга ноорог болгон хадгалагдана. Дараа нь засаж илгээж болно.'
            : `${selectedHandler?.fullName}-д захиалга илгээгдэнэ. Илгээсний дараа хотын ажилтан хүлээн авах хүртэл засах боломжтой.`
        }
        confirmLabel={isDraft ? 'Ноорог хадгалах' : 'Захиалга илгээх'}
        loading={loading}
        onConfirm={() => handleSubmit(isDraft)}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
