import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'
import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment'
import prisma from '../../prisma'

export class PrismaAppointmentRepository implements IAppointmentRepository {
  async findById(id: number): Promise<Appointment | null> {
    return prisma.appointment.findUnique({ where: { id } })
  }

  async findByDoctorAndDate(licenseNumber: number, date: Date): Promise<Appointment[]> {
    const start = new Date(date)
    start.setUTCHours(0, 0, 0, 0)
    const end = new Date(date)
    end.setUTCHours(23, 59, 59, 999)

    return prisma.appointment.findMany({
      where: {
        doctorLicense: licenseNumber,
        scheduledAt: { gte: start, lte: end }
      }
    })
  }

  async findByDoctor(licenseNumber: number, from: Date, to: Date): Promise<Appointment[]> {
    const rows = await prisma.appointment.findMany({
      where: {
        doctorLicense: licenseNumber,
        scheduledAt: { gte: from, lte: to },
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        patient: {
          include: { user: { select: { name: true, lastname: true } } },
        },
        specialty: { select: { name: true } },
      },
    })
    return rows.map(r => ({
      ...r,
      patientName:       (r as any).patient?.user?.name ?? null,
      patientLastname:   (r as any).patient?.user?.lastname ?? null,
      patientSocialWork: (r as any).patient?.socialWork ?? null,
      specialtyName:     (r as any).specialty?.name ?? null,
    })) as any
  }

  async findByPatient(patientDni: number): Promise<Appointment[]> {
    const rows = await prisma.appointment.findMany({
      where: { patientDni },
      orderBy: { scheduledAt: 'desc' },
      include: {
        specialty: { select: { name: true } },
        doctor: { include: { user: { select: { name: true, lastname: true } } } },
      },
    })
    return rows.map(r => ({
      ...r,
      specialtyName: (r as any).specialty?.name ?? null,
      doctorName: (r as any).doctor?.user
        ? `${(r as any).doctor.user.name} ${(r as any).doctor.user.lastname}`
        : null,
    })) as any
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
