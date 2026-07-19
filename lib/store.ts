'use client'

import { mockOrders } from '@/mock/orders'
import { mockNotifications } from '@/mock/notifications'
import { mockActivityLogs } from '@/mock/activity'
import { mockUsers } from '@/mock/users'
import type { MoldOrder, User, Notification, ActivityLog } from '@/types'

const ORDERS_KEY = 'mu_orders'
const USERS_KEY = 'mu_users'
const NOTIFICATIONS_KEY = 'mu_notifications'
const ACTIVITY_KEY = 'mu_activity'
const SESSION_KEY = 'mu_session'
const DEMO_ROLE_KEY = 'mu_demo_role'

function parseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

// Orders
export function getStoredOrders(): MoldOrder[] {
  if (typeof window === 'undefined') return mockOrders
  const stored = localStorage.getItem(ORDERS_KEY)
  if (!stored) {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders))
    return mockOrders
  }
  return parseJSON<MoldOrder[]>(stored, mockOrders)
}

export function setStoredOrders(orders: MoldOrder[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

export function upsertOrder(order: MoldOrder): void {
  const orders = getStoredOrders()
  const idx = orders.findIndex((o) => o.id === order.id)
  if (idx >= 0) orders[idx] = order
  else orders.unshift(order)
  setStoredOrders(orders)
}

// Users
export function getStoredUsers(): User[] {
  if (typeof window === 'undefined') return mockUsers
  const stored = localStorage.getItem(USERS_KEY)
  if (!stored) {
    localStorage.setItem(USERS_KEY, JSON.stringify(mockUsers))
    return mockUsers
  }
  return parseJSON<User[]>(stored, mockUsers)
}

export function setStoredUsers(users: User[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function upsertUser(user: User): void {
  const users = getStoredUsers()
  const idx = users.findIndex((u) => u.id === user.id)
  if (idx >= 0) users[idx] = user
  else users.unshift(user)
  setStoredUsers(users)
}

// Notifications
export function getStoredNotifications(): Notification[] {
  if (typeof window === 'undefined') return mockNotifications
  const stored = localStorage.getItem(NOTIFICATIONS_KEY)
  if (!stored) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(mockNotifications))
    return mockNotifications
  }
  return parseJSON<Notification[]>(stored, mockNotifications)
}

export function setStoredNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications))
}

// Activity
export function getStoredActivity(): ActivityLog[] {
  if (typeof window === 'undefined') return mockActivityLogs
  const stored = localStorage.getItem(ACTIVITY_KEY)
  if (!stored) {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(mockActivityLogs))
    return mockActivityLogs
  }
  return parseJSON<ActivityLog[]>(stored, mockActivityLogs)
}

export function addActivityLog(log: ActivityLog): void {
  const logs = getStoredActivity()
  logs.unshift(log)
  if (typeof window !== 'undefined') {
    localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs))
  }
}

// Session
export function getSession(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(SESSION_KEY)
  return parseJSON<User | null>(stored, null)
}

export function setSession(user: User | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }
}

// Demo role
export function getDemoRole(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(DEMO_ROLE_KEY)
}

export function setDemoRole(role: string | null): void {
  if (typeof window === 'undefined') return
  if (role) localStorage.setItem(DEMO_ROLE_KEY, role)
  else localStorage.removeItem(DEMO_ROLE_KEY)
}

// Generate order number
export function generateOrderNumber(): string {
  const orders = getStoredOrders()
  const today = new Date()
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '')
  const count = orders.length + 1
  return `MU-${dateStr}-${String(count).padStart(4, '0')}`
}

// Generate ID
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
