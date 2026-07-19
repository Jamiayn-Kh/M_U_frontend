'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AppLayout } from '@/components/AppLayout'
import { useToast } from '@/components/Toast'
import { Shield, Info, Settings as SettingsIcon, Bell, Clock, Hash, FlaskConical } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const toast = useToast()

  const [prefix, setPrefix] = useState('MU')
  const [systemName, setSystemName] = useState('Мөнгөн урлал')
  const [waitThreshold, setWaitThreshold] = useState('48')
  const [notifyReceived, setNotifyReceived] = useState(true)
  const [notifyTransported, setNotifyTransported] = useState(true)
  const [notifyDelayed, setNotifyDelayed] = useState(true)
  const [saving, setSaving] = useState(false)

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      toast.success('Тохиргоо хадгалагдлаа', 'Прототип горимд өгөгдлийн сан руу хадгалагдахгүй.')
      setSaving(false)
    }, 600)
  }

  if (user?.role !== 'ADMIN') {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground">Хандах эрх байхгүй</p>
          <p className="text-muted-foreground text-sm mt-1">Тохиргоо зөвхөн администраторт харагдана.</p>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Системийн тохиргоо</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Системийн үндсэн параметрүүд</p>
          </div>
        </div>

        {/* Prototype notice */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
          <FlaskConical className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm">
            Эдгээр тохиргоо нь <strong>прототипийн горимд</strong> ажиллаж байна. Хадгалах товчийг дарсан ч өгөгдлийн сан руу хадгалагдахгүй. Бэлэн арын системтэй холбогдох үед бодит байдлаар ажиллана.
          </p>
        </div>

        {/* General settings */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <SettingsIcon className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Ерөнхий тохиргоо</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">Системийн нэр</label>
            <input
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
            <p className="text-xs text-muted-foreground mt-1">Бүх хуудасны гарчиг болон логод харагдах нэр.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5 flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" />
              Захиалгын дугаарын угтвар
            </label>
            <div className="flex items-center gap-2">
              <input
                value={prefix}
                onChange={(e) => setPrefix(e.target.value.toUpperCase().slice(0, 4))}
                maxLength={4}
                className="w-24 px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <span className="text-sm text-muted-foreground">→ жишээ: <span className="font-mono text-foreground">{prefix}-20260718-0001</span></span>
            </div>
          </div>
        </div>

        {/* Wait threshold */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Хоцрогдлын тохиргоо</h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Хүлээх хугацааны хязгаар (цаг)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={waitThreshold}
                onChange={(e) => setWaitThreshold(e.target.value)}
                min={1}
                max={720}
                className="w-24 px-3 py-2.5 text-sm rounded-lg border border-border bg-background text-foreground tabular-nums focus:outline-none focus:ring-2 focus:ring-ring/50"
              />
              <span className="text-sm text-muted-foreground">цагийн дараа мэдэгдэл илгээнэ</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Захиалга {waitThreshold} цагийн дотор хүлээн авагдаагүй бол "Хоцорсон" гэж тэмдэглэнэ.
            </p>
          </div>
        </div>

        {/* Notification prefs */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 mb-1">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Мэдэгдлийн тохиргоо</h2>
          </div>

          {[
            { label: 'Захиалга хүлээн авсан үед мэдэгдэх', value: notifyReceived, set: setNotifyReceived },
            { label: 'Захиалга унаанд тавьсан үед мэдэгдэх', value: notifyTransported, set: setNotifyTransported },
            { label: 'Хоцорсон захиалгын тухай сануулах', value: notifyDelayed, set: setNotifyDelayed },
          ].map((item) => (
            <label key={item.label} className="flex items-center justify-between cursor-pointer select-none py-1">
              <span className="text-sm text-foreground">{item.label}</span>
              <button
                onClick={() => item.set((v) => !v)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  item.value ? 'bg-primary' : 'bg-border'
                }`}
                role="switch"
                aria-checked={item.value}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${item.value ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          ))}
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />}
            Тохиргоо хадгалах
          </button>
        </div>
      </div>
    </AppLayout>
  )
}
