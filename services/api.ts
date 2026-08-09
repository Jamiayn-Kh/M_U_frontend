import { apiRequest, setAuthToken, clearAuth } from '@/lib/api-client'
import type {
  User,
  LoginCredentials,
  AuthSession,
  MoldOrder,
  CreateMoldOrderRequest,
  UserInfo,
  MoldOrderItem,
  TransportInfo,
  Adjustment,
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

type MoldOrderApiResponse = Omit<MoldOrder, 'seller' | 'items' | 'transport'> & {
  seller?: UserInfo | null
  items?: MoldOrderItem[] | null
  transport?: TransportInfo | null
  departureDate?: string | null
  departureTime?: string | null
  busNumber?: string | null
  driverPhone?: string | null
  transportNote?: string | null
}

function normalizeMoldOrder(order: MoldOrderApiResponse): MoldOrder {
  return {
    ...order,
    seller: order.seller ?? {
      id: 0,
      username: '',
      fullName: 'Борлуулагчийн мэдээлэл алга',
    },
    items: order.items ?? [],
    transport: order.transport ?? {
      departureDate: order.departureDate ?? null,
      departureTime: order.departureTime ?? null,
      busNumber: order.busNumber ?? null,
      driverPhone: order.driverPhone ?? null,
      note: order.transportNote ?? null,
    },
  }
}

export async function getMoldOrders(): Promise<MoldOrder[]> {
  const response = await apiRequest<MoldOrderApiResponse[]>('/api/v1/mold-orders')
  return response.map(normalizeMoldOrder)
}

export async function getMoldOrderById(id: number): Promise<MoldOrder> {
  const response = await apiRequest<MoldOrderApiResponse>(`/api/v1/mold-orders/${id}`)
  return normalizeMoldOrder(response)
}

export async function getMoldOrdersWithRecentDetails(limit = 5): Promise<MoldOrder[]> {
  const orders = await getMoldOrders()
  const recentDetails = await Promise.all(
    orders.slice(0, limit).map(async (order) => {
      try {
        return await getMoldOrderById(order.id)
      } catch {
        return order
      }
    })
  )
  const detailsById = new Map(recentDetails.map((order) => [order.id, order]))

  return orders.map((order) => detailsById.get(order.id) ?? order)
}

export async function createMoldOrder(data: CreateMoldOrderRequest): Promise<MoldOrder> {
  const response = await apiRequest<MoldOrderApiResponse>('/api/v1/mold-orders', {
    method: 'POST',
    body: data,
  })
  return normalizeMoldOrder(response)
}

export async function receiveMoldOrder(id: number): Promise<MoldOrder> {
  const response = await apiRequest<MoldOrderApiResponse>(`/api/v1/mold-orders/${id}/receive`, {
    method: 'PATCH',
  })
  return normalizeMoldOrder(response)
}

export async function processMoldOrder(id: number): Promise<MoldOrder> {
  const response = await apiRequest<MoldOrderApiResponse>(`/api/v1/mold-orders/${id}/process`, {
    method: 'PATCH',
  })
  return normalizeMoldOrder(response)
}

interface TransportMoldOrderData {
  departureDate: string
  departureTime: string
  busNumber: string
  driverPhone: string
  note?: string
}

export async function transportMoldOrder(id: number, data: TransportMoldOrderData): Promise<MoldOrder> {
  const response = await apiRequest<MoldOrderApiResponse>(`/api/v1/mold-orders/${id}/transport`, {
    method: 'PATCH',
    body: data,
  })
  return normalizeMoldOrder(response)
}

export async function completeMoldOrder(id: number): Promise<MoldOrder> {
  const response = await apiRequest<MoldOrderApiResponse>(`/api/v1/mold-orders/${id}/complete`, {
    method: 'PATCH',
  })
  return normalizeMoldOrder(response)
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
): Promise<Adjustment> {
  return await apiRequest<Adjustment>(
    `/api/v1/mold-orders/${orderId}/items/${itemId}/adjustments`,
    {
      method: 'POST',
      body: data,
    }
  )
}
