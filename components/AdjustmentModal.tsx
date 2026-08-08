'use client'

import { useState } from 'react'
import type { MoldOrderItem, AdjustmentAction } from '@/types'
import { X, AlertCircle } from 'lucide-react'

interface Props {
  item: MoldOrderItem
  onConfirm: (data: {
    action: AdjustmentAction
    finalMoldCode: string | null
    finalQuantity: number
    note?: string
  }) => Promise<void>
  onClose: () => void
}

export function AdjustmentModal({ item, onConfirm, onClose }: Props) {
  const [action, setAction] = useState<AdjustmentAction>('KEEP')
  const [finalMoldCode, setFinalMoldCode] = useState(item.moldCode)
  const [finalQuantity, setFinalQuantity] = useState(item.quantity)
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    

    
    if (action === 'ADD') {
      if (!finalMoldCode.trim()) e.finalMoldCode = 'Загварын код оруулна уу'
      if (!/^[AKS][0-9]{1,4}$/i.test(finalMoldCode.trim())) {
        e.finalMoldCode = 'Код A, K, S үсгээр эхэлж 1-4 оронтой тоо байна'
      }
      if (finalQuantity < 1) e.finalQuantity = 'Тоо ширхэг хамгийн багадаа 1 байна'
    }
    
    return e
  }

  async function handleSubmit() {
    const e = validate()
    if (Object.keys(e).length > 0) {
      setErrors(e)
      return
    }
    
    setLoading(true)
    try {
      await onConfirm({
        action,
        finalMoldCode: action === 'CANCEL' ? null : finalMoldCode.trim().toUpperCase(),
        finalQuantity: action === 'CANCEL' ? 0 : finalQuantity,
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
          <div>
            <h2 className="font-semibold text-foreground text-sm">Өөрчлөлт тэмдэглэх</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Анх: {item.moldCode} × {item.quantity}
            </p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-foreground mb-2">
              Үйлдэл <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <input
                  type="radio"
                  name="action"
                  value="KEEP"
                  checked={action === 'KEEP'}
                  onChange={() => {
                    setAction('KEEP')
                    setFinalMoldCode(item.moldCode)
                    setFinalQuantity(item.quantity)
                    setErrors({})
                  }}
                  className="h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Байгаагаар нь авсан</span>
                  <p className="text-xs text-muted-foreground">Анхны кодоор, тоо өөрчлөх</p>
                </div>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <input
                  type="radio"
                  name="action"
                  value="ADD"
                  checked={action === 'ADD'}
                  onChange={() => {
                    setAction('ADD')
                    setFinalMoldCode('')
                    setFinalQuantity(1)
                    setErrors({})
                  }}
                  className="h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Өөр хэв нэмсэн / сольсон</span>
                  <p className="text-xs text-muted-foreground">Шинэ загварын код оруулах</p>
                </div>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <input
                  type="radio"
                  name="action"
                  value="CANCEL"
                  checked={action === 'CANCEL'}
                  onChange={() => {
                    setAction('CANCEL')
                    setFinalMoldCode('')
                    setFinalQuantity(0)
                    setErrors({})
                  }}
                  className="h-4 w-4"
                />
                <div>
                  <span className="text-sm font-medium text-foreground">Авахаа больсон</span>
                  <p className="text-xs text-muted-foreground">Хэв байхгүй эсвэл шаардлагагүй</p>
                </div>
              </label>
            </div>
          </div>

          {action !== 'CANCEL' && (
            <>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Загварын код <span className="text-red-500">*</span>
                </label>
                <input
                  value={finalMoldCode}
                  onChange={(e) => setFinalMoldCode(e.target.value.toUpperCase())}
                  placeholder="A125"
                  disabled={action === 'KEEP'}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.finalMoldCode ? 'border-red-400 bg-red-50' : 'border-border bg-background'
                  } ${action === 'KEEP' ? 'bg-secondary text-muted-foreground' : 'text-foreground'} placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
                />
                {errors.finalMoldCode && (
                  <p className="text-xs text-red-600 mt-0.5">{errors.finalMoldCode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Тоо ширхэг <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={finalQuantity}
                  onChange={(e) => setFinalQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min={1}
                  max={action === 'KEEP' ? item.quantity : undefined}
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${
                    errors.finalQuantity ? 'border-red-400 bg-red-50' : 'border-border bg-background'
                  } text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
                />
                {errors.finalQuantity && (
                  <p className="text-xs text-red-600 mt-0.5">{errors.finalQuantity}</p>
                )}
                {action === 'KEEP' && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Хамгийн ихдээ {item.quantity} ширхэг
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Тайлбар <span className="text-muted-foreground font-normal">(заавал биш)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Өөрчлөлтийн шалтгаан..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 resize-none"
            />
          </div>

          {action === 'CANCEL' && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                Энэ хэвийг цуцлах тохиолдолд анхны захиалгын мэдээлэл хадгалагдах боловч бодитоор авахгүй гэж тэмдэглэгдэнэ.
              </p>
            </div>
          )}
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
            {loading && (
              <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
            )}
            Хадгалах
          </button>
        </div>
      </div>
    </div>
  )
}
