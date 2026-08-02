'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createMoldOrder } from '@/services/api'
import { Plus, Trash2, AlertCircle } from 'lucide-react'
import { ConfirmDialog } from '@/components/ConfirmDialog'

interface MoldRow {
  id: string
  moldCode: string
  quantity: number
  stoneRequired: boolean
  _error?: string
}

function emptyRow(): MoldRow {
  return { id: Math.random().toString(36), moldCode: '', quantity: 1, stoneRequired: false }
}

function validateMoldCode(code: string): boolean {
  return /^[AKS][0-9]{1,4}$/i.test(code)
}

export default function NewOrderPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [note, setNote] = useState('')
  const [rows, setRows] = useState<MoldRow[]>([emptyRow()])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  if (!user || user.role !== 'PROVINCE_SELLER') {
    return (
      <div className="text-center py-24">
        <p className="text-xl font-semibold text-foreground mb-2">Хандах эрхгүй</p>
        <p className="text-muted-foreground">Зөвхөн аймгийн борлуулагч захиалга үүсгэх боломжтой.</p>
      </div>
    )
  }

  function updateRow(id: string, field: keyof MoldRow, value: string | boolean | number) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const updated = { ...r, [field]: value }
        if (field === 'moldCode') {
          const code = (value as string).trim().toUpperCase()
          updated.moldCode = code
          if (code && !validateMoldCode(code)) {
            updated._error = 'Код A, K, S үсгээр эхэлж 1-4 оронтой тоо байна'
          } else {
            const dupe = prev.some((other) => other.id !== id && other.moldCode === code && code !== '')
            updated._error = dupe ? 'Давхардсан код' : undefined
          }
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const validRows = rows.filter((r) => r.moldCode.trim())
    if (validRows.length === 0) {
      setError('Хамгийн багадаа нэг загварын код оруулна уу')
      return
    }

    const hasErrors = rows.some((r) => r._error)
    if (hasErrors) {
      setError('Кодын алдааг засаад дахин оролдоно уу')
      return
    }

    const hasDuplicates = new Set(validRows.map(r => r.moldCode)).size !== validRows.length
    if (hasDuplicates) {
      setError('Давхардсан код байна')
      return
    }

    // Show confirmation dialog
    setShowConfirm(true)
  }

  async function confirmSubmit() {
    const validRows = rows.filter((r) => r.moldCode.trim())
    
    setLoading(true)
    setShowConfirm(false)
    
    try {
      const order = await createMoldOrder({
        note: note.trim() || undefined,
        items: validRows.map((r) => ({
          moldCode: r.moldCode.toUpperCase(),
          quantity: r.quantity,
          stoneRequired: r.stoneRequired,
        })),
      })
      router.push(`/orders/${order.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Шинэ захиалга үүсгэх</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Загварын захиалга бөглөж хотын ажилтанд илгээнэ</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Борлуулагч
          </label>
          <input
            value={user.fullName}
            disabled
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-secondary text-muted-foreground"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            Нэмэлт тайлбар <span className="text-muted-foreground font-normal">(заавал биш)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Захиалгатай холбоотой нэмэлт мэдээлэл..."
            className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground text-sm">Загварын кодууд</h2>
            <span className="text-xs text-muted-foreground">{rows.filter(r => r.moldCode.trim()).length} код</span>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground px-1">
              <span className="col-span-1">#</span>
              <span className="col-span-5">Загварын код *</span>
              <span className="col-span-2">Тоо *</span>
              <span className="col-span-3">Шигтгээтэй</span>
              <span className="col-span-1" />
            </div>

            {rows.map((row, idx) => (
              <div key={row.id} className="grid grid-cols-12 gap-2 items-start">
                <span className="col-span-1 text-sm text-muted-foreground pt-2.5">{idx + 1}</span>
                <div className="col-span-5">
                  <input
                    value={row.moldCode}
                    onChange={(e) => updateRow(row.id, 'moldCode', e.target.value.toUpperCase())}
                    placeholder="A125"
                    className={`w-full px-2.5 py-2 text-sm rounded-lg border ${
                      row._error ? 'border-red-400 bg-red-50' : 'border-border bg-background'
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
                    className="w-full px-2.5 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="col-span-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={row.stoneRequired}
                      onChange={(e) => updateRow(row.id, 'stoneRequired', e.target.checked)}
                      className="h-4 w-4 rounded border-border"
                    />
                    <span className="text-sm text-foreground">Тийм</span>
                  </label>
                </div>
                <div className="col-span-1 flex justify-center pt-2">
                  <button
                    type="button"
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
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Мөр нэмэх
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Болих
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors flex items-center gap-2"
          >
            {loading && (
              <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            )}
            {loading ? 'Илгээж байна...' : 'Захиалга илгээх'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showConfirm}
        title="Захиалга илгээх үү?"
        description={`Та ${rows.filter(r => r.moldCode.trim()).length} загварын код бүхий захиалгыг хотын ажилтан руу илгээх гэж байна. Захиалгын мэдээлэл зөв эсэхийг шалгана уу.`}
        confirmLabel="Илгээх"
        loading={loading}
        onConfirm={confirmSubmit}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}
