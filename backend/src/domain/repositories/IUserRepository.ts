import { User } from '../entities/User'

export interface IUserRepository {
  findById(id: number): Promise<User | null>
  findByDni(dni: number): Promise<User | null>
  findByLicenseNumber(licenseNumber: number): Promise<User | null>
  create(data: {
    dni: number
    licenseNumber?: number
    password: string
    role?: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  }): Promise<User>
}