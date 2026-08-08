import { apiRequest, setAuthToken, clearAuth } from '@/lib/api-client'
import type {
  User,
  LoginCredentials,
  AuthSession,
  MoldOrder,
  CreateMoldOrderRequest,
} from '@/types'

// ─── Auth ────────────────────────────────────────────────────────────────────

interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    fullName: string
    role: 'ADMIN' | 'PROVINCE_SELLER' | 'CITY_HANDLER' | 'CRAFTSMAN'
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthSession> {
  const response = await apiRequest<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: {
      username: credentials.username,
      password: credentials.password,
    },
    skipAuth: true,
  })

  const user: User = {
    id: response.user.id,
    username: response.user.username,
    fullName: response.user.fullName,
    phone: null,
    role: response.user.role,
    active: true,
    createdAt: new Date().toISOString(),
  }

  setAuthToken(response.token)

  if (typeof window !== 'undefined') {
    localStorage.setItem('mu_session', JSON.stringify(user))
  }

  return {
    user,
    token: response.token,
  }
}

export async function logout(): Promise<void> {
  clearAuth()
}

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem('mu_session')
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

// ─── Users ───────────────────────────────────────────────────────────────────

interface UserResponse {
  id: number
  username: string
  fullName: string
  phone: string | null
  role: 'ADMIN' | 'PROVINCE_SELLER' | 'CITY_HANDLER' | 'CRAFTSMAN'
  active: boolean
  createdAt: string
}

export async function getUsers(): Promise<User[]> {
  const response = await apiRequest<UserResponse[]>('/api/v1/users')
  return response.map((u) => ({
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    phone: u.phone,
    role: u.role,
    active: u.active,
    createdAt: u.createdAt,
  }))
}

interface CreateUserData {
  username: string
  password: string
  fullName: string
  phone: string
  role: 'ADMIN' | 'PROVINCE_SELLER' | 'CITY_HANDLER' | 'CRAFTSMAN'
}

export async function createUser(data: CreateUserData): Promise<User> {
  const response = await apiRequest<UserResponse>('/api/v1/users', {
    method: 'POST',
    body: data,
  })

  return {
    id: response.id,
    username: response.username,
    fullName: response.fullName,
    phone: response.phone,
    role: response.role,
    active: response.active,
    createdAt: response.createdAt,
  }
}

export async function updateUser(id: number, data: Partial<User>): Promise<User> {
  throw new Error('Not implemented')
}

export async function toggleUserStatus(id: number): Promise<User> {
  throw new Error('Not implemented')
}

// ─── Mold Orders ─────────────────────────────────────────────────────────────

export async function getMoldOrders(): Promise<MoldOrder[]> {
  return await apiRequest<MoldOrder[]>('/api/v1/mold-orders')
}

export async function getMoldOrderById(id: number): Promise<MoldOrder> {
  return await apiRequest<MoldOrder>(`/api/v1/mold-orders/${id}`)
}

export async function createMoldOrder(data: CreateMoldOrderRequest): Promise<MoldOrder> {
  return await apiRequest<MoldOrder>('/api/v1/mold-orders', {
    method: 'POST',
    body: data,
  })
}

export async function receiveMoldOrder(id: number): Promise<MoldOrder> {
  return await apiRequest<MoldOrder>(`/api/v1/mold-orders/${id}/receive`, {
    method: 'PATCH',
  })
}

export async function processMoldOrder(id: number): Promise<MoldOrder> {
  return await apiRequest<MoldOrder>(`/api/v1/mold-orders/${id}/process`, {
    method: 'PATCH',
  })
}

interface TransportMoldOrderData {
  departureDate: string
  departureTime: string
  busNumber: string
  driverPhone: string
  note?: string
}

export async function transportMoldOrder(id: number, data: TransportMoldOrderData): Promise<MoldOrder> {
  return await apiRequest<MoldOrder>(`/api/v1/mold-orders/${id}/transport`, {
    method: 'PATCH',
    body: data,
  })
}

export async function completeMoldOrder(id: number): Promise<MoldOrder> {
  return await apiRequest<MoldOrder>(`/api/v1/mold-orders/${id}/complete`, {
    method: 'PATCH',
  })
}

// ─── Adjustments ─────────────────────────────────────────────────────────────

interface CreateAdjustmentData {
  action: 'KEEP' | 'ADD' | 'CANCEL'
  finalMoldCode: string | null
  finalQuantity: number
  note?: string
}

export async function createAdjustment(
  orderId: number,
  itemId: number,
  data: CreateAdjustmentData
): Promise<MoldOrder> {
  return await apiRequest<MoldOrder>(
    `/api/v1/mold-orders/${orderId}/items/${itemId}/adjustments`,
    {
      method: 'POST',
      body: data,
    }
  )
}
