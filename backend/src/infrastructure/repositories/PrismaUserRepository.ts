import { IUserRepository } from '../../domain/repositories/IUserRepository'
import { User } from '../../domain/entities/User'
import prisma from '../../prisma'

function withLicense(
  raw: Awaited<ReturnType<typeof prisma.user.findUnique>> & {
    doctor?: { licenseNumber: number } | null
  }
): User {
  const { doctor, ...user } = raw as any
  return { ...user, licenseNumber: doctor?.licenseNumber ?? null }
}

export class PrismaUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { id },
      include: { doctor: { select: { licenseNumber: true } } },
    })
    return result ? withLicense(result) : null
  }

  async findByDni(dni: number): Promise<User | null> {
    const result = await prisma.user.findUnique({
      where: { dni },
      include: { doctor: { select: { licenseNumber: true } } },
    })
    return result ? withLicense(result) : null
  }

  async create(data: {
    dni: number
    name: string
    lastname: string
    password: string
    role?: 'PATIENT' | 'DOCTOR' | 'ADMIN'
  }): Promise<User> {
    const result = await prisma.user.create({ data })
    return { ...result, licenseNumber: null }
  }
}
