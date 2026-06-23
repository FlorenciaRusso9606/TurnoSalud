import { IDoctorAvailabilityRepository } from '../../domain/repositories/IDoctorAvailabilityRepository'
import { DoctorAvailability } from '../../domain/entities/DoctorAvailability'
import prisma from '../../prisma'

export class PrismaDoctorAvailabilityRepository implements IDoctorAvailabilityRepository {
  async findByDoctorAndDate(licenseNumber: number, date: Date): Promise<DoctorAvailability | null> {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return prisma.doctorAvailability.findFirst({
      where: {
        licenseNumber,
        date: { gte: start, lte: end }
      }
    })
  }

  async findBySpecialtyAndDate(specialtyId: number, date: Date): Promise<DoctorAvailability[]> {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return prisma.doctorAvailability.findMany({
      where: {
        doctor: { specialtyId },
        date: { gte: start, lte: end }
      }
    })
  }

  async create(data: {
    licenseNumber: number
    date: Date
    startTime: string
    endTime: string
    intervalMinutes?: number
  }): Promise<DoctorAvailability> {
    return prisma.doctorAvailability.create({ data })
  }
}
