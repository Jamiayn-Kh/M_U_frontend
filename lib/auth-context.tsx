'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@/types'
import { getAuthToken } from '@/lib/api-client'

interface AuthContextValue {
  user: User | null
  setUser: (u: User | null) => void
  loading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  loading: true,
  signOut: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mu_session')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setUserState(parsed)
        } catch {
          localStorage.removeItem('mu_session')
        }
      }
    }
    setLoading(false)
  }, [])

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    if (typeof window !== 'undefined') {
      if (u) {
        localStorage.setItem('mu_session', JSON.stringify(u))
      } else {
        localStorage.removeItem('mu_session')
      }
    }
  }, [])

  const signOut = useCallback(() => {
    setUserState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mu_session')
      localStorage.removeItem('mu_token')
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

