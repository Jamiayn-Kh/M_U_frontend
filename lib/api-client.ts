const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ApiError {
  message: string
  status: number
}

export class ApiClientError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
  }
}

let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('mu_token', token)
    } else {
      localStorage.removeItem('mu_token')
    }
  }
}

export function getAuthToken(): string | null {
  if (!authToken && typeof window !== 'undefined') {
    authToken = localStorage.getItem('mu_token')
  }
  return authToken
}

export function clearAuth(): void {
  authToken = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mu_token')
    localStorage.removeItem('mu_session')
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  skipAuth?: boolean
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, skipAuth = false } = options

  const token = getAuthToken()
  if (!skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  if (body) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!response.ok) {
      if (response.status === 401) {
        clearAuth()
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
        throw new ApiClientError('Нэвтрэх хугацаа дууссан байна', 401)
      }

      if (response.status === 403) {
        throw new ApiClientError('Хандах эрхгүй байна', 403)
      }

      if (response.status === 409) {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.message || 'Давхардсан өгөгдөл байна'
        if (message.toLowerCase().includes('username')) {
          throw new ApiClientError('Энэ нэвтрэх нэр аль хэдийн бүртгэгдсэн байна', 409)
        }
        throw new ApiClientError(message, 409)
      }

      const errorData = await response.json().catch(() => ({}))
      throw new ApiClientError(
        errorData.message || `Алдаа гарлаа (${response.status})`,
        response.status
      )
    }

    if (response.status === 204) {
      return undefined as T
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error
    }

    if (error instanceof TypeError) {
      throw new ApiClientError('Холболт амжилтгүй боллоо', 0)
    }

    throw new ApiClientError('Тодорхойгүй алдаа гарлаа', 0)
  }
}
