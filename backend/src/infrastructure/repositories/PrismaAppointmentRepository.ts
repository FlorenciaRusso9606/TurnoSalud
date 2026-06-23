import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'
import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment'
import prisma from '../../prisma'

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async findById(id: number): Promise<Appointment | null> {
    return prisma.appointment.findUnique({ where: { id } })
  }

  async findByDoctorAndDate(licenseNumber: number, date: Date): Promise<Appointment[]> {
    const start = new Date(date)
    start.setHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    return prisma.appointment.findMany({
      where: {
        doctorLicense: licenseNumber,
        scheduledAt: { gte: start, lte: end }
      }
    })
  }

  async findByPatient(patientDni: number): Promise<Appointment[]> {
    return prisma.appointment.findMany({
      where: { patientDni },
      orderBy: { scheduledAt: 'desc' }
    })
  }

  async create(data: {
    scheduledAt: Date
    patientDni: number
    doctorLicense: number
    specialtyId: number
  }): Promise<Appointment> {
    return prisma.appointment.create({ data })
  }

  async updateStatus(id: number, status: AppointmentStatus): Promise<Appointment> {
    return prisma.appointment.update({
      where: { id },
      data: { status }
    })
  }
}
