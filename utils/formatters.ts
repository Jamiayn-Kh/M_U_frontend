import type { MoldOrderStatus, UserRole } from '@/types'

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('mn-MN', {
    month: 'short',
    day: 'numeric',
  })
}

export function statusLabel(status: MoldOrderStatus): string {
  const map: Record<MoldOrderStatus, string> = {
    DRAFT: 'Ноорог',
    SENT: 'Илгээсэн',
    RECEIVED: 'Хот хүлээн авсан',
    IN_PROCESS: 'Цуглуулж байна',
    TRANSPORTED: 'Унаанд тавьсан',
    COMPLETED: 'Хүлээн авсан',
    CANCELLED: 'Цуцлагдсан',
  }
  return map[status] ?? status
}

export function roleLabel(role: UserRole): string {
  const map: Record<UserRole, string> = {
    ADMIN: 'Админ',
    PROVINCE_SELLER: 'Аймгийн борлуулагч',
    CITY_HANDLER: 'Хотын ажилтан',
    CRAFTSMAN: 'Дархан',
  }
  return map[role] ?? role
}

export function statusColor(status: MoldOrderStatus): string {
  const map: Record<MoldOrderStatus, string> = {
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
    SENT: 'bg-blue-50 text-blue-700 border-blue-200',
    RECEIVED: 'bg-amber-50 text-amber-700 border-amber-200',
    IN_PROCESS: 'bg-orange-50 text-orange-700 border-orange-200',
    TRANSPORTED: 'bg-green-50 text-green-700 border-green-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-red-50 text-red-600 border-red-200',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

export function statusDot(status: MoldOrderStatus): string {
  const map: Record<MoldOrderStatus, string> = {
    DRAFT: 'bg-slate-400',
    SENT: 'bg-blue-500',
    RECEIVED: 'bg-amber-500',
    IN_PROCESS: 'bg-orange-500',
    TRANSPORTED: 'bg-green-500',
    COMPLETED: 'bg-emerald-500',
    CANCELLED: 'bg-red-500',
  }
  return map[status] ?? 'bg-gray-400'
}
