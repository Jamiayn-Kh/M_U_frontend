'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Gem } from 'lucide-react'

export default function RootPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/login')
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
          <Gem className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
