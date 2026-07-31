'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/lib/auth-context'
import { AppLayout } from '@/components/AppLayout'
import { EmptyState } from '@/components/EmptyState'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { getUsers, createUser, updateUser, toggleUserStatus } from '@/services/api'
import { roleLabel, formatDate } from '@/utils/formatters'
import {
  Search, Plus, X, ChevronDown, Edit2, Power, User as UserIcon,
  Phone, Shield,
} from 'lucide-react'
import type { User, UserRole } from '@/types'

const ROLES: { value: UserRole; label: string }[] = [
  { value: 'ADMIN', label: 'Админ' },
  { value: 'PROVINCE_SELLER', label: 'Аймгийн борлуулагч' },
  { value: 'CITY_HANDLER', label: 'Хотын ажилтан' },
  { value: 'CRAFTSMAN', label: 'Дархан' },
]

interface UserFormData {
  fullName: string
  phone: string
  username: string
  password: string
  role: UserRole
}

function emptyForm(): UserFormData {
  return { fullName: '', phone: '', username: '', password: '', role: 'PROVINCE_SELLER' }
}

function UserDrawer({
  mode,
  initial,
  existingUsernames,
  onSave,
  onClose,
}: {
  mode: 'create' | 'edit'
  initial: UserFormData
  existingUsernames: string[]
  onSave: (data: UserFormData) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<UserFormData>(initial)
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({})
  const [loading, setLoading] = useState(false)

  function set(key: keyof UserFormData, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const e: Partial<Record<keyof UserFormData, string>> = {}
    if (!form.fullName.trim()) e.fullName = 'Нэр оруулна уу'
    if (!form.phone.trim()) e.phone = 'Утасны дугаар оруулна уу'
    else if (!/^\d{8}$/.test(form.phone.replace(/[-\s]/g, ''))) e.phone = '8 оронтой дугаар оруулна уу'
    if (!form.username.trim()) e.username = 'Нэвтрэх нэр оруулна уу'
    else if (mode === 'create' && existingUsernames.includes(form.username.trim())) e.username = 'Энэ нэвтрэх нэр аль хэдийн бүртгэгдсэн байна'
    if (mode === 'create' && !form.password.trim()) e.password = 'Нууц үг оруулна уу'
    else if (mode === 'create' && form.password.length < 8) e.password = 'Нууц үг 8-аас дээш тэмдэгттэй байх ёстой'
    return e
  }

  async function handleSave() {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    try { await onSave(form) } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{mode === 'create' ? 'Хэрэглэгч нэмэх' : 'Мэдээлэл засах'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">Овог нэр <span className="text-red-500">*</span></label>
              <input value={form.fullName} onChange={(e) => set('fullName', e.target.value)}
                placeholder="Батболд Нарантуяа"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.fullName ? 'border-red-400' : 'border-border'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.fullName && <p className="text-xs text-red-600 mt-0.5">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Утасны дугаар <span className="text-red-500">*</span></label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                placeholder="99001234"
                type="tel"
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.phone ? 'border-red-400' : 'border-border'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.phone && <p className="text-xs text-red-600 mt-0.5">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Нэвтрэх нэр <span className="text-red-500">*</span></label>
              <input value={form.username} onChange={(e) => set('username', e.target.value.toLowerCase())}
                placeholder="username"
                disabled={mode === 'edit'}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.username ? 'border-red-400' : 'border-border'} ${mode === 'edit' ? 'bg-secondary text-muted-foreground' : 'bg-background text-foreground'} placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
              />
              {errors.username && <p className="text-xs text-red-600 mt-0.5">{errors.username}</p>}
            </div>
            {mode === 'create' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-foreground mb-1">Нууц үг <span className="text-red-500">*</span></label>
                <input value={form.password} onChange={(e) => set('password', e.target.value)}
                  placeholder="Хамгийн багадаа 8 тэмдэгт"
                  type="password"
                  className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.password ? 'border-red-400' : 'border-border'} bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50`}
                />
                {errors.password && <p className="text-xs text-red-600 mt-0.5">{errors.password}</p>}
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-foreground mb-1">Үүрэг <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.role} onChange={(e) => set('role', e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50">
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 px-5 py-4 border-t border-border bg-secondary/30">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2.5 border border-border rounded-lg text-sm text-foreground hover:bg-secondary transition-colors disabled:opacity-60">Болих</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading && <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />}
            {mode === 'create' ? 'Нэмэх' : 'Хадгалах'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { user } = useAuth()
  const toast = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('')
  const [activeFilter, setActiveFilter] = useState<'' | 'active' | 'inactive'>('')
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [toggleTarget, setToggleTarget] = useState<User | null>(null)

  useEffect(() => {
    setLoading(true)
    getUsers().then((u) => { setUsers(u); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let list = [...users]
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((u) => 
        u.fullName.toLowerCase().includes(q) || 
        u.username.toLowerCase().includes(q) || 
        (u.phone && u.phone.includes(q))
      )
    }
    if (roleFilter) list = list.filter((u) => u.role === roleFilter)
    if (activeFilter === 'active') list = list.filter((u) => u.active)
    if (activeFilter === 'inactive') list = list.filter((u) => !u.active)
    return list
  }, [users, search, roleFilter, activeFilter])

  async function handleCreate(data: UserFormData) {
    try {
      const created = await createUser(data)
      setUsers((prev) => [created, ...prev])
      toast.success('Хэрэглэгч нэмэгдлээ')
      setDrawerMode(null)
    } catch (e) {
      if (e instanceof Error) {
        toast.error('Алдаа гарлаа', e.message)
      } else {
        toast.error('Алдаа гарлаа')
      }
    }
  }

  async function handleEdit(data: UserFormData) {
    toast.error('Засах боломжгүй', 'Хэрэглэгч засах функц хараахан хийгдээгүй байна')
    setDrawerMode(null)
    setEditingUser(null)
  }

  async function handleToggle() {
    toast.error('Боломжгүй', 'Төлөв өөрчлөх функц хараахан хийгдээгүй байна')
    setToggleTarget(null)
  }

  if (user?.role !== 'ADMIN') {
    return (
      <AppLayout>
        <div className="text-center py-24">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-semibold text-foreground">Хандах эрх байхгүй</p>
          <p className="text-muted-foreground text-sm mt-1">Энэ хуудас зөвхөн администраторт харагдана.</p>
        </div>
      </AppLayout>
    )
  }

  const existingUsernames = users.map((u) => u.username)

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Хэрэглэгчид</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Нийт {filtered.length} хэрэглэгч</p>
          </div>
          <button
            onClick={() => setDrawerMode('create')}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" /> Хэрэглэгч нэмэх
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Нэр, нэвтрэх нэр, утас..."
              className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                className="pl-3 pr-8 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50">
                <option value="">Бүх үүрэг</option>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="relative">
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value as '' | 'active' | 'inactive')}
                className="pl-3 pr-8 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-ring/50">
                <option value="">Бүх төлөв</option>
                <option value="active">Идэвхтэй</option>
                <option value="inactive">Идэвхгүй</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-secondary rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Хэрэглэгч олдсонгүй" description="Шүүлтүүрийг өөрчлөн дахин хайна уу." />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Нэр</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Утас</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Нэвтрэх нэр</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Үүрэг</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Төлөв</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{u.fullName}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.phone || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary text-foreground border border-border">
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${
                          u.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-secondary text-muted-foreground border-border'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.active ? 'bg-green-500' : 'bg-slate-400'}`} />
                          {u.active ? 'Идэвхтэй' : 'Идэвхгүй'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          <button
                            onClick={() => { setEditingUser(u); setDrawerMode('edit') }}
                            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="Засах"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setToggleTarget(u)}
                            className={`h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                              u.active ? 'text-muted-foreground hover:text-red-500 hover:bg-red-50' : 'text-muted-foreground hover:text-green-600 hover:bg-green-50'
                            }`}
                            title={u.active ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {filtered.map((u) => (
                <div key={u.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-primary">{u.fullName[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{u.fullName}</p>
                        <p className="text-xs text-muted-foreground">{u.username}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full border ${u.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-secondary text-muted-foreground border-border'}`}>
                      {u.active ? 'Идэвхтэй' : 'Идэвхгүй'}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" />{u.phone || '—'}</div>
                    <div className="flex items-center gap-1.5"><Shield className="h-3 w-3" />{roleLabel(u.role)}</div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                    <button onClick={() => { setEditingUser(u); setDrawerMode('edit') }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border border-border rounded-lg text-foreground hover:bg-secondary transition-colors">
                      <Edit2 className="h-3 w-3" /> Засах
                    </button>
                    <button onClick={() => setToggleTarget(u)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs border rounded-lg transition-colors ${u.active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                      <Power className="h-3 w-3" />
                      {u.active ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* User drawer */}
      {drawerMode && (
        <UserDrawer
          mode={drawerMode}
          initial={drawerMode === 'edit' && editingUser
            ? {
                fullName: editingUser.fullName,
                phone: editingUser.phone || '',
                username: editingUser.username,
                password: '',
                role: editingUser.role,
              }
            : emptyForm()
          }
          existingUsernames={existingUsernames}
          onSave={drawerMode === 'create' ? handleCreate : handleEdit}
          onClose={() => { setDrawerMode(null); setEditingUser(null) }}
        />
      )}

      {/* Toggle confirm */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.active ? 'Идэвхгүй болгох уу?' : 'Идэвхжүүлэх үү?'}
        description={
          toggleTarget?.active
            ? `${toggleTarget?.fullName} системд нэвтрэх боломжгүй болно.`
            : `${toggleTarget?.fullName} системд нэвтрэх боломжтой болно.`
        }
        confirmLabel={toggleTarget?.active ? 'Идэвхгүй болгох' : 'Идэвхжүүлэх'}
        variant={toggleTarget?.active ? 'destructive' : 'default'}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </AppLayout>
  )
}
