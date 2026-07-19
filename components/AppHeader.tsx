'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { roleLabel } from '@/utils/formatters'
import { getStoredNotifications } from '@/lib/store'
import { Bell, ChevronDown, LogOut, User, Menu, Gem } from 'lucide-react'

interface Props {
  onMobileMenuOpen?: () => void
}

export function AppHeader({ onMobileMenuOpen }: Props) {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return
    const all = getStoredNotifications()
    const unread = all.filter((n) => n.userId === user.id && !n.read).length
    setUnreadCount(unread)
  }, [user])

  const handleSignOut = () => {
    signOut()
    router.push('/login')
  }

  return (
    <header className="h-[60px] bg-card border-b border-border flex items-center px-4 gap-3 flex-shrink-0">
      {/* Mobile menu button */}
      <button
        className="md:hidden text-muted-foreground hover:text-foreground transition-colors"
        onClick={onMobileMenuOpen}
        aria-label="Цэс нээх"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile logo */}
      <Link href="/dashboard" className="md:hidden flex items-center gap-2">
        <div className="h-7 w-7 bg-primary rounded-lg flex items-center justify-center">
          <Gem className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm text-foreground">Мөнгөн урлал</span>
      </Link>

      <div className="flex-1" />

      {/* Notification bell */}
      <Link
        href="/notifications"
        className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-secondary"
        aria-label="Мэдэгдэлүүд"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>

      {/* User menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          <div className="h-7 w-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-semibold text-primary">
              {user?.fullName?.[0] ?? 'U'}
            </span>
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-sm font-medium text-foreground leading-tight truncate max-w-32">{user?.fullName}</p>
            <p className="text-[10px] text-muted-foreground">{user ? roleLabel(user.role) : ''}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-40 py-1 overflow-hidden">
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                onClick={() => setDropdownOpen(false)}
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Профайл
              </Link>
              <div className="h-px bg-border my-1" />
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Гарах
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
