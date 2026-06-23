import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { User } from '../../domain/entities/User'
import prisma from '../../prisma'

export class PrismaUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } })
  }

  async findByDni(dni: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { dni } })
  }

  async findByLicenseNumber(licenseNumber: number): Promise<User | null> {
    return prisma.user.findUnique({ where: { licenseNumber } })
  }

  async create(data: {
    dni: number
    licenseNumber?: number
    password: string
    role?: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  }): Promise<User> {
    return prisma.user.create({ data })
  }
}
