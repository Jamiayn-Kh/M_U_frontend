export type UserRole = 'ADMIN' | 'PROVINCE_SELLER' | 'CITY_HANDLER' | 'CRAFTSMAN'

export type MoldOrderStatus =
  | 'DRAFT'
  | 'SENT'
  | 'RECEIVED'
  | 'IN_PROCESS'
  | 'TRANSPORTED'
  | 'COMPLETED'
  | 'CANCELLED'

export type AdjustmentAction = 'KEEP' | 'ADD' | 'CANCEL'

export interface User {
  id: number
  fullName: string
  phone: string | null
  username: string
  role: UserRole
  active: boolean
  createdAt: string
}

export interface Adjustment {
  id: number
  action: AdjustmentAction
  finalMoldCode: string | null
  finalQuantity: number
  note: string | null
  approved: boolean
  approvedAt: string | null
  createdAt: string
}

export interface MoldOrderItem {
  id: number
  moldCode: string
  codePrefix: string
  quantity: number
  stoneRequired: boolean
  adjustments: Adjustment[]
}

export interface TransportInfo {
  departureDate: string | null
  departureTime: string | null
  busNumber: string | null
  driverPhone: string | null
  note: string | null
}

export interface UserInfo {
  id: number
  username: string
  fullName: string
}

export interface MoldOrder {
  id: number
  seller: UserInfo
  cityHandler: UserInfo | null
  status: MoldOrderStatus
  note: string | null
  items: MoldOrderItem[]
  transport: TransportInfo
  createdAt: string
  sentAt: string | null
  receivedAt: string | null
  transportedAt: string | null
  completedAt: string | null
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthSession {
  user: User
  token: string
}

export interface CreateMoldOrderRequest {
  note?: string
  items: Array<{
    moldCode: string
    quantity: number
    stoneRequired: boolean
  }>
}

export interface CreateAdjustmentRequest {
  action: AdjustmentAction
  finalMoldCode: string | null
  finalQuantity: number
  note?: string
}
