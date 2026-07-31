import { apiRequest, setAuthToken, clearAuth } from '@/lib/api-client'
import type {
  User,
  LoginCredentials,
  AuthSession,
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

  return {
    user,
    token: response.token,
  }
}

export async function logout(): Promise<void> {
  clearAuth()
}

export async function getCurrentUser(): Promise<User | null> {
  return null
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
