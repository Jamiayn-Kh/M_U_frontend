'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { login } from '@/services/api'
import { mockUsers } from '@/mock/users'
import { roleLabel } from '@/utils/formatters'
import { Eye, EyeOff, Gem, AlertCircle, ChevronDown } from 'lucide-react'
import type { UserRole } from '@/types'

const DEMO_ACCOUNTS = [
  { username: 'admin', password: 'admin123', role: 'ADMIN' as UserRole, label: 'Админ' },
  { username: 'seller1', password: 'seller123', role: 'PROVINCE_SELLER' as UserRole, label: 'Аймгийн борлуулагч' },
  { username: 'handler1', password: 'handler123', role: 'CITY_HANDLER' as UserRole, label: 'Хотын ажилтан' },
  { username: 'craftsman1', password: 'craft123', role: 'CRAFTSMAN' as UserRole, label: 'Дархан' },
]

export default function LoginPage() {
  const router = useRouter()
  const { user, setUser } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username.trim()) { setError('Нэвтрэх нэрийг оруулна уу'); return }
    if (!password.trim()) { setError('Нууц үгийг оруулна уу'); return }
    setError('')
    setLoading(true)
    try {
      const session = await login({ username: username.trim(), password, remember })
      setUser(session.user)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally {
      setLoading(false)
    }
  }

  function handleDemoLogin(acc: typeof DEMO_ACCOUNTS[0]) {
    setUsername(acc.username)
    setPassword(acc.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex w-[420px] flex-shrink-0 bg-sidebar flex-col justify-between p-10">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-sidebar-primary rounded-xl flex items-center justify-center">
            <Gem className="h-4.5 w-4.5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sidebar-primary leading-tight text-sm">Мөнгөн урлал</p>
            <p className="text-[10px] text-sidebar-foreground/50">Захиалгын систем</p>
          </div>
        </div>
        <div>
          <blockquote className="text-sidebar-foreground/80 text-lg font-light leading-relaxed">
            &ldquo;Аймаг болон хотын хооронд загваруудын захиалгыг хялбар, найдвартай зохицуулна.&rdquo;
          </blockquote>
          <p className="text-sidebar-foreground/40 text-sm mt-4">Мөнгөн урлалын дотоод систем</p>
        </div>
        <div className="space-y-3">
          {[
            { label: 'Аймгийн борлуулагч → Захиалга үүсгэнэ' },
            { label: 'Хотын ажилтан → Хүлээн авч унаанд тавина' },
            { label: 'Админ → Бүх үйл явцыг хянана' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3 text-sidebar-foreground/60 text-sm">
              <span className="h-5 w-5 rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-xs flex items-center justify-center font-medium flex-shrink-0">
                {i + 1}
              </span>
              {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — login */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-8 w-8 bg-primary rounded-xl flex items-center justify-center">
              <Gem className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Мөнгөн урлал</p>
              <p className="text-[10px] text-muted-foreground">Захиалгын систем</p>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-foreground mb-1">Нэвтрэх</h1>
          <p className="text-sm text-muted-foreground mb-6">Системд нэвтрэхийн тулд мэдээллээ оруулна уу</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Нэвтрэх нэр
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="username"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Нууц үг
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 transition-shadow pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPw ? 'Нуух' : 'Харах'}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              <span className="text-sm text-muted-foreground">Намайг сана</span>
            </label>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              )}
              {loading ? 'Нэвтэрч байна...' : 'Нэвтрэх'}
            </button>
          </form>

          {/* Demo role switcher */}
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border" />
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider px-2">
                Туршилтын горим
              </p>
              <div className="h-px flex-1 bg-border" />
            </div>
            <p className="text-xs text-muted-foreground mb-3 text-center">
              Прототип туршихын тулд доорх дүрийг сонгоно уу
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  onClick={() => handleDemoLogin(acc)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-secondary hover:bg-secondary/80 text-left transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-bold text-primary">{acc.label[0]}</span>
                  </div>
                  <span className="text-xs text-foreground leading-tight">{acc.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">
              Нэвтрэх нэр болон нууц үг автоматаар бөглөгдөнө
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
