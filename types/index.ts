export type UserRole = 'ADMIN' | 'PROVINCE_SELLER' | 'CITY_HANDLER' | 'CRAFTSMAN'

export type OrderStatus =
  | 'DRAFT'
  | 'SENT'
  | 'RECEIVED'
  | 'IN_PROCESS'
  | 'TRANSPORTED'
  | 'CANCELLED'

export interface User {
  id: number
  fullName: string
  phone: string | null
  username: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface MoldCodeItem {
  id: string
  code: string
  quantity: number
  note?: string
}

export interface TransportInfo {
  transportStation: string
  vehicleNumber: string
  driverPhone: string
  departureDate: string
  departureTime: string
  note?: string
}

export interface StatusHistory {
  id: string
  orderId: string
  previousStatus: OrderStatus | null
  newStatus: OrderStatus
  changedBy: string
  changedByRole: UserRole
  changedAt: string
  note?: string
}

export interface MoldOrder {
  id: string
  orderNumber: string
  provinceSellerId: string
  provinceSellerName: string
  province: string
  cityHandlerId: string
  cityHandlerName: string
  moldCodes: MoldCodeItem[]
  sellerNote?: string
  cityHandlerNote?: string
  transportInfo?: TransportInfo
  status: OrderStatus
  createdAt: string
  receivedAt?: string
  transportedAt?: string
  updatedAt: string
  statusHistory: StatusHistory[]
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'new_order' | 'order_received' | 'order_transported' | 'order_delayed' | 'general'
  orderId?: string
  orderNumber?: string
  read: boolean
  createdAt: string
}

export interface ActivityLog {
  id: string
  userId: string
  userName: string
  userRole: UserRole
  action: string
  orderId?: string
  orderNumber?: string
  previousValue?: string
  newValue?: string
  note?: string
  createdAt: string
}

export interface LoginCredentials {
  username: string
  password: string
  remember?: boolean
}

export interface AuthSession {
  user: User
  token: string
}
