/**
 * Service layer — all functions here are designed to be replaced
 * with real REST API calls to a Java Spring Boot backend.
 * Replace the body of each function with `return fetch('/api/...')`
 * when the backend is ready.
 */

import {
  getStoredOrders,
  getStoredUsers,
  getStoredNotifications,
  getStoredActivity,
  upsertOrder,
  upsertUser,
  setStoredNotifications,
  addActivityLog,
  setSession,
  getSession,
  generateOrderNumber,
  generateId,
} from '@/lib/store'
import { mockPasswords } from '@/mock/users'
import type {
  User,
  MoldOrder,
  MoldCodeItem,
  TransportInfo,
  OrderStatus,
  Notification,
  ActivityLog,
  LoginCredentials,
  AuthSession,
} from '@/types'

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  await delay(600)
  const users = getStoredUsers()
  const user = users.find((u) => u.username === credentials.username)
  if (!user || !user.active) throw new Error('Нэвтрэх нэр эсвэл нууц үг буруу байна')
  const expectedPw = mockPasswords[credentials.username]
  if (expectedPw !== credentials.password) throw new Error('Нэвтрэх нэр эсвэл нууц үг буруу байна')
  setSession(user)
  return { user, token: `mock-token-${user.id}` }
}

export async function logout(): Promise<void> {
  await delay(200)
  setSession(null)
}

export async function getCurrentUser(): Promise<User | null> {
  await delay(100)
  return getSession()
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(): Promise<MoldOrder[]> {
  await delay()
  return getStoredOrders()
}

export async function getOrderById(id: string): Promise<MoldOrder | null> {
  await delay()
  const orders = getStoredOrders()
  return orders.find((o) => o.id === id) ?? null
}

export interface CreateOrderInput {
  cityHandlerId: string
  cityHandlerName: string
  moldCodes: MoldCodeItem[]
  sellerNote?: string
  isDraft?: boolean
  currentUser: User
}

export async function createOrder(input: CreateOrderInput): Promise<MoldOrder> {
  await delay(700)
  const now = new Date().toISOString()
  const status: OrderStatus = input.isDraft ? 'DRAFT' : 'SENT'
  const order: MoldOrder = {
    id: generateId('o'),
    orderNumber: generateOrderNumber(),
    provinceSellerId: input.currentUser.id,
    provinceSellerName: input.currentUser.fullName,
    province: input.currentUser.province,
    cityHandlerId: input.cityHandlerId,
    cityHandlerName: input.cityHandlerName,
    moldCodes: input.moldCodes,
    sellerNote: input.sellerNote,
    status,
    createdAt: now,
    updatedAt: now,
    statusHistory: status === 'SENT' ? [{
      id: generateId('sh'),
      orderId: '',
      previousStatus: null,
      newStatus: 'SENT',
      changedBy: input.currentUser.fullName,
      changedByRole: input.currentUser.role,
      changedAt: now,
    }] : [],
  }
  order.statusHistory.forEach((h) => { h.orderId = order.id })
  upsertOrder(order)
  if (status === 'SENT') {
    addActivityLog({
      id: generateId('al'),
      userId: input.currentUser.id,
      userName: input.currentUser.fullName,
      userRole: input.currentUser.role,
      action: 'Захиалга үүсгэсэн',
      orderId: order.id,
      orderNumber: order.orderNumber,
      newValue: 'SENT',
      createdAt: now,
    })
  }
  return order
}

export async function updateDraftOrder(orderId: string, input: Partial<CreateOrderInput>): Promise<MoldOrder> {
  await delay(500)
  const orders = getStoredOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Захиалга олдсонгүй')
  const now = new Date().toISOString()
  const updated = { ...order, ...input, updatedAt: now }
  upsertOrder(updated)
  return updated
}

export async function cancelOrder(orderId: string, currentUser: User, note?: string): Promise<MoldOrder> {
  await delay(500)
  const orders = getStoredOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Захиалга олдсонгүй')
  const now = new Date().toISOString()
  const updated: MoldOrder = {
    ...order,
    status: 'CANCELLED',
    updatedAt: now,
    statusHistory: [
      ...order.statusHistory,
      {
        id: generateId('sh'),
        orderId,
        previousStatus: order.status,
        newStatus: 'CANCELLED',
        changedBy: currentUser.fullName,
        changedByRole: currentUser.role,
        changedAt: now,
        note,
      },
    ],
  }
  upsertOrder(updated)
  addActivityLog({
    id: generateId('al'),
    userId: currentUser.id,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action: 'Захиалга цуцалсан',
    orderId,
    orderNumber: order.orderNumber,
    previousValue: order.status,
    newValue: 'CANCELLED',
    note,
    createdAt: now,
  })
  return updated
}

export async function confirmOrderReceived(orderId: string, currentUser: User, note?: string): Promise<MoldOrder> {
  await delay(500)
  const orders = getStoredOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Захиалга олдсонгүй')
  const now = new Date().toISOString()
  const updated: MoldOrder = {
    ...order,
    status: 'RECEIVED',
    receivedAt: now,
    updatedAt: now,
    statusHistory: [
      ...order.statusHistory,
      {
        id: generateId('sh'),
        orderId,
        previousStatus: order.status,
        newStatus: 'RECEIVED',
        changedBy: currentUser.fullName,
        changedByRole: currentUser.role,
        changedAt: now,
        note,
      },
    ],
  }
  upsertOrder(updated)
  addActivityLog({
    id: generateId('al'),
    userId: currentUser.id,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action: 'Захиалга хүлээн авсан',
    orderId,
    orderNumber: order.orderNumber,
    previousValue: 'SENT',
    newValue: 'RECEIVED',
    createdAt: now,
  })
  return updated
}

export async function startOrderProcessing(orderId: string, currentUser: User, note?: string): Promise<MoldOrder> {
  await delay(500)
  const orders = getStoredOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Захиалга олдсонгүй')
  const now = new Date().toISOString()
  const updated: MoldOrder = {
    ...order,
    status: 'IN_PROCESS',
    cityHandlerNote: note ?? order.cityHandlerNote,
    updatedAt: now,
    statusHistory: [
      ...order.statusHistory,
      {
        id: generateId('sh'),
        orderId,
        previousStatus: order.status,
        newStatus: 'IN_PROCESS',
        changedBy: currentUser.fullName,
        changedByRole: currentUser.role,
        changedAt: now,
        note,
      },
    ],
  }
  upsertOrder(updated)
  addActivityLog({
    id: generateId('al'),
    userId: currentUser.id,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action: 'Бэлтгэлт эхэлсэн',
    orderId,
    orderNumber: order.orderNumber,
    previousValue: 'RECEIVED',
    newValue: 'IN_PROCESS',
    createdAt: now,
  })
  return updated
}

export async function markOrderTransported(
  orderId: string,
  currentUser: User,
  transportInfo: TransportInfo
): Promise<MoldOrder> {
  await delay(600)
  const orders = getStoredOrders()
  const order = orders.find((o) => o.id === orderId)
  if (!order) throw new Error('Захиалга олдсонгүй')
  const now = new Date().toISOString()
  const updated: MoldOrder = {
    ...order,
    status: 'TRANSPORTED',
    transportInfo,
    transportedAt: now,
    updatedAt: now,
    statusHistory: [
      ...order.statusHistory,
      {
        id: generateId('sh'),
        orderId,
        previousStatus: order.status,
        newStatus: 'TRANSPORTED',
        changedBy: currentUser.fullName,
        changedByRole: currentUser.role,
        changedAt: now,
        note: transportInfo.note,
      },
    ],
  }
  upsertOrder(updated)
  addActivityLog({
    id: generateId('al'),
    userId: currentUser.id,
    userName: currentUser.fullName,
    userRole: currentUser.role,
    action: 'Унаанд тавьсан',
    orderId,
    orderNumber: order.orderNumber,
    previousValue: 'IN_PROCESS',
    newValue: 'TRANSPORTED',
    note: `Тэргэнцэр: ${transportInfo.vehicleNumber}`,
    createdAt: now,
  })
  return updated
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<User[]> {
  await delay()
  return getStoredUsers()
}

export async function createUser(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
  await delay(500)
  const user: User = {
    ...data,
    id: generateId('u'),
    createdAt: new Date().toISOString(),
  }
  upsertUser(user)
  return user
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  await delay(400)
  const users = getStoredUsers()
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('Хэрэглэгч олдсонгүй')
  const updated = { ...user, ...data }
  upsertUser(updated)
  return updated
}

export async function toggleUserStatus(id: string): Promise<User> {
  await delay(300)
  const users = getStoredUsers()
  const user = users.find((u) => u.id === id)
  if (!user) throw new Error('Хэрэглэгч олдсонгүй')
  const updated = { ...user, active: !user.active }
  upsertUser(updated)
  return updated
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  await delay(200)
  const all = getStoredNotifications()
  return all.filter((n) => n.userId === userId)
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(100)
  const all = getStoredNotifications()
  const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n))
  setStoredNotifications(updated)
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await delay(100)
  const all = getStoredNotifications()
  const updated = all.map((n) => (n.userId === userId ? { ...n, read: true } : n))
  setStoredNotifications(updated)
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export async function getActivityLogs(): Promise<ActivityLog[]> {
  await delay()
  return getStoredActivity()
}
