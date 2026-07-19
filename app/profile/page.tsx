'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppLayout } from '@/components/AppLayout'
import { useToast } from '@/components/Toast'
import { logout, updateUser } from '@/services/api'
import { roleLabel, formatDate } from '@/utils/formatters'
import { Eye, EyeOff, LogOut, User, Phone, Building2, MapPin, Shield, Calendar, Lock } from 'lucide-react'

export default function ProfilePage() {
  const { user, setUser, signOut } = useAuth()
  const router = useRouter()
  const toast = useToast()

  const [editMode, setEditMode] = useState(false)
  const [fullName, setFullName] = useState(user?.fullName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)

  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const [logoutLoading, setLogoutLoading] = useState(false)

  async function handleSaveProfile() {
    if (!user) return
    if (!fullName.trim()) { toast.error('Нэр хоосон байна'); return }
    setSaving(true)
    try {
      const updated = await updateUser(user.id, { fullName: fullName.trim(), phone: phone.trim() })
      setUser(updated)
      toast.success('Профайл шинэчлэгдлээ')
      setEditMode(false)
    } catch (e) {
      toast.error('Алдаа гарлаа', e instanceof Error ? e.message : undefined)
    } finally {
      setSaving(false)
    }
  }

  function handleChangePassword() {
    setPwError('')
    if (!currentPw) { setPwError('Одоогийн нууц үгийг оруулна уу'); return }
    if (!newPw || newPw.length < 6) { setPwError('Шинэ нууц үг 6-аас дээш тэмдэгт байна уу'); return }
    if (newPw !== confirmPw) { setPwError('Нууц үг таарахгүй байна'); return }
    // Frontend mock — just show success
    setPwLoading(true)
    setTimeout(() => {
      toast.success('Нууц үг амжилттай солигдлоо')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setPwLoading(false)
    }, 600)
  }

  async function handleLogout() {
    setLogoutLoading(true)
    await logout()
    signOut()
    router.push('/login')
  }

  if (!user) return null

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <h1 className="text-xl font-semibold text-foreground">Профайл</h1>

        {/* Profile card */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-start gap-4 mb-5">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xl font-bold text-primary">{user.fullName[0]}</span>
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base">{user.fullName}</h2>
              <p className="text-sm text-muted-foreground">{user.username}</p>
              <span className="inline-flex items-center gap-1.5 text-xs mt-1 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                <Shield className="h-3 w-3" />
                {roleLabel(user.role)}
              </span>
            </div>
          </div>

          {/* Info grid */}
          {!editMode ? (
            <div className="space-y-3 text-sm">
              {[
                { icon: User, label: 'Овог нэр', value: user.fullName },
                { icon: Phone, label: 'Утасны дугаар', value: user.phone },
                { icon: User, label: 'Нэвтрэх нэр', value: user.username },
                { icon: MapPin, label: 'Аймаг / Хот', value: user.province },
                { icon: Building2, label: 'Байгууллага', value: user.organizationName },
                { icon: Calendar, label: 'Бүртгүүлсэн', value: formatDate(user.createdAt) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground w-32 flex-shrink-0">{item.label}</span>
                  <span className="text-foreground font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Овог нэр</label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Утасны дугаар</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">Нэвтрэх нэр, аймаг, байгууллагыг засахын тулд администратортой холбоо барина уу.</p>
            </div>
          )}

          <div className="flex gap-2 mt-5 pt-5 border-t border-border">
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-secondary transition-colors"
              >
                Засах
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setEditMode(false); setFullName(user.fullName); setPhone(user.phone) }}
                  disabled={saving}
                  className="px-4 py-2 text-sm border border-border rounded-lg text-foreground hover:bg-secondary transition-colors disabled:opacity-60"
                >
                  Болих
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
                >
                  {saving && <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />}
                  Хадгалах
                </button>
              </>
            )}
          </div>
        </div>

        {/* Change password */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <Lock className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold text-foreground text-sm">Нууц үг солих</h2>
          </div>

          <div className="space-y-3 max-w-sm">
            {['Одоогийн нууц үг', 'Шинэ нууц үг', 'Шинэ нууц үг (давтах)'].map((label, i) => {
              const vals = [currentPw, newPw, confirmPw]
              const setters = [setCurrentPw, setNewPw, setConfirmPw]
              return (
                <div key={label}>
                  <label className="block text-xs font-medium text-foreground mb-1">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={vals[i]}
                      onChange={(e) => setters[i](e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground pr-10 focus:outline-none focus:ring-2 focus:ring-ring/50"
                    />
                    {i === 0 && (
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
            {pwError && <p className="text-xs text-red-600">{pwError}</p>}
            <button
              onClick={handleChangePassword}
              disabled={pwLoading}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {pwLoading && <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />}
              Нууц үг солих
            </button>
          </div>
        </div>

        {/* Sign out */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">Системээс гарах</p>
              <p className="text-xs text-muted-foreground mt-0.5">Одоогийн сессийг дуусгаж нэвтрэх хуудас руу буцна.</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-lg text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors disabled:opacity-60"
            >
              {logoutLoading
                ? <span className="h-4 w-4 rounded-full border-2 border-red-600 border-t-transparent animate-spin" />
                : <LogOut className="h-4 w-4" />
              }
              Гарах
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
