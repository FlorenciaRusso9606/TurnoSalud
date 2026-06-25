import { User } from '../entities/User'

export interface IUserRepository {
  findById(id: number): Promise<User | null>
  findByDni(dni: number): Promise<User | null>
  create(data: {
    dni: number
    name: string
    lastname: string
    password: string
    role?: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  }): Promise<User>
}