'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { AppSidebar } from './AppSidebar'
import { AppHeader } from './AppHeader'
import { ToastProvider } from './Toast'
import { X, Gem } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { roleLabel } from '@/utils/formatters'
import {
  LayoutDashboard, ClipboardList, Plus, Users, History,
  Settings, Bell, User, Package, Truck, Inbox,
} from 'lucide-react'

interface NavItem { href: string; label: string; icon: React.ElementType }

function getMobileNavItems(role: string): NavItem[] {
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
        { href: '/orders', label: 'Ирсэн захиалгууд', icon: Inbox },
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
  children: React.ReactNode
}

export function AppLayout({ children }: Props) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
            <Gem className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="h-1.5 w-20 bg-secondary rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const navItems = getMobileNavItems(user.role)
  const isActive = (href: string) => {
    const path = href.split('?')[0]
    if (path === '/dashboard') return pathname === '/dashboard'
    if (path === '/orders/new') return pathname === '/orders/new'
    return pathname.startsWith(path) && path !== '/dashboard'
  }

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-shrink-0">
          <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        </div>

        {/* Mobile Drawer Overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <aside className="relative z-50 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col">
              <div className="flex items-center justify-between px-4 py-4 border-b border-sidebar-border">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 bg-sidebar-primary rounded-lg flex items-center justify-center">
                    <Gem className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
                  </div>
                  <span className="font-semibold text-sm text-sidebar-primary">Мөнгөн урлал</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground/50 hover:text-sidebar-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {navItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${
                        active
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                      }`}
                    >
                      <item.icon className="h-4.5 w-4.5 flex-shrink-0" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="border-t border-sidebar-border px-4 py-3">
                <p className="text-xs font-medium text-sidebar-foreground">{user.fullName}</p>
                <p className="text-[10px] text-sidebar-foreground/50 mt-0.5">{roleLabel(user.role)}</p>
              </div>
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AppHeader onMobileMenuOpen={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
