'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '@/types'
import { getSession, setSession } from '@/lib/store'

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
    const stored = getSession()
    setUserState(stored)
    setLoading(false)
  }, [])

  const setUser = useCallback((u: User | null) => {
    setUserState(u)
    setSession(u)
  }, [])

  const signOut = useCallback(() => {
    setUserState(null)
    setSession(null)
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
