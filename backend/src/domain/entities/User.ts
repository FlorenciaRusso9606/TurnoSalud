export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export interface User {
  id: number
  dni: number
  name: string
  lastname: string
  licenseNumber?: number | null
  password: string
  role: Role
  isActive: boolean
  email?: string | null
  phone?: string | null
  address?: string | null
  createdAt: Date
}

export interface UserPublic {
  id: number
  dni: number
  role: Role
}