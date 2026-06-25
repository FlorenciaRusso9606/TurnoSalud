export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export interface User {
  id: number
  dni: number
  name: string
  lastname: string
  licenseNumber?: number | null
  password: string
  role: Role
  createdAt: Date
}

export interface UserPublic {
  id: number
  dni: number
  role: Role
}