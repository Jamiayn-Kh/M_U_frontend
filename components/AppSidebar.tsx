'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { roleLabel } from '@/utils/formatters'
import {
  LayoutDashboard,
  ClipboardList,
  Plus,
  Users,
  History,
  Settings,
  Bell,
  User,
  Package,
  Truck,
  Inbox,
  ChevronLeft,
  ChevronRight,
  Gem,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return [
        { href: '/dashboard', label: 'Хяналтын самбар', icon: LayoutDashboard },
        { href: '/orders', label: 'Бүх захиалга', icon: ClipboardList },
        { href: '/users', label: 'Хэрэглэгчид', icon: Users },
        { href: '/activity', label: 'Үйл ажиллагааны түүх', icon: History },
        { href: '/settings', label: 'Тохиргоо', icon: Settings },
      ]
    case 'PROVINCE_SELLER':
      return [
        { href: '/dashboard', label: 'Хяналтын самбар', icon: LayoutDashboard },
        { href: '/orders/new', label: 'Шинэ захиалга', icon: Plus },
        { href: '/orders', label: 'Миний захиалгууд', icon: ClipboardList },
        { href: '/notifications', label: 'Мэдэгдэл', icon: Bell },
        { href: '/profile', label: 'Профайл', icon: User },
      ]
    case 'CITY_HANDLER':
      return [
        { href: '/dashboard', label: 'Хяналтын самбар', icon: LayoutDashboard },
        { href: '/orders?status=SENT', label: 'Ирсэн захиалгууд', icon: Inbox },
        { href: '/orders?status=IN_PROCESS', label: 'Бэлтгэж байгаа', icon: Package },
        { href: '/orders?status=TRANSPORTED', label: 'Унаанд тавьсан', icon: Truck },
        { href: '/notifications', label: 'Мэдэгдэл', icon: Bell },
        { href: '/profile', label: 'Профайл', icon: User },
      ]
    case 'CRAFTSMAN':
      return [
        { href: '/dashboard', label: 'Хяналтын самбар', icon: LayoutDashboard },
        { href: '/profile', label: 'Профайл', icon: User },
      ]
    default:
      return []
  }
}

interface Props {
  collapsed: boolean
  onToggle: () => void
}

export function AppSidebar({ collapsed, onToggle }: Props) {
  const { user } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const navItems = user ? getNavItems(user.role) : []

  const isActive = (href: string) => {
    const [path, query] = href.split('?')
    if (path === '/dashboard') return pathname === '/dashboard'
    if (path === '/orders/new') return pathname === '/orders/new'
    if (path === '/orders' && pathname === '/orders') {
      const expectedStatus = new URLSearchParams(query ?? '').get('status') ?? ''
      return (searchParams.get('status') ?? '') === expectedStatus
    }
    if (path === '/orders' && pathname.startsWith('/orders/')) return !query
    return pathname.startsWith(path) && path !== '/dashboard'
  }

  return (
    <aside
      className={`h-full bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border min-h-[60px]">
        <div className="flex-shrink-0 h-8 w-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
          <Gem className="h-4 w-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-semibold text-sm text-sidebar-primary leading-tight">Мөнгөн урлал</p>
            <p className="text-[10px] text-sidebar-foreground/60 truncate">Захиалгын систем</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      {user && !collapsed && (
        <div className="border-t border-sidebar-border px-4 py-3">
          <p className="text-xs font-medium text-sidebar-foreground truncate">{user.fullName}</p>
          <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">{roleLabel(user.role)}</p>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="border-t border-sidebar-border px-4 py-3 flex items-center justify-center text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        aria-label={collapsed ? 'Өргөжүүлэх' : 'Хураах'}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  )
}
