'use client'

import { useAuth } from '@/lib/auth-context'
import { AdminDashboard } from '@/features/dashboard/AdminDashboard'
import { SellerDashboard } from '@/features/dashboard/SellerDashboard'
import { HandlerDashboard } from '@/features/dashboard/HandlerDashboard'
import { CraftsmanDashboard } from '@/features/dashboard/CraftsmanDashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  if (!user) return null

  switch (user.role) {
    case 'ADMIN': return <AdminDashboard />
    case 'PROVINCE_SELLER': return <SellerDashboard />
    case 'CITY_HANDLER': return <HandlerDashboard />
    case 'CRAFTSMAN': return <CraftsmanDashboard />
    default: return null
  }
}
