import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'
import { IDoctorAvailabilityRepository } from '../../domain/repositories/IDoctorAvailabilityRepository'
import { Appointment } from '../../domain/entities/Appointment'

interface Input {
  patientDni: number
  doctorLicense: number
  specialtyId: number
  scheduledAt: Date
}

export class BookAppointmentUseCase {
  constructor(
    private appointmentRepository: IAppointmentRepository,
    private availabilityRepository: IDoctorAvailabilityRepository
  ) {}

  async execute(input: Input): Promise<Appointment> {
    const availability = await this.availabilityRepository.findByDoctorAndDate(
      input.doctorLicense,
      input.scheduledAt
    )
    if (!availability) {
      throw new Error('El médico no tiene disponibilidad para esa fecha')
    }

    const [startH, startM] = availability.startTime.split(':').map(Number)
    const [endH, endM] = availability.endTime.split(':').map(Number)
    const slotMinutes = input.scheduledAt.getHours() * 60 + input.scheduledAt.getMinutes()
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    if (slotMinutes < startMinutes || slotMinutes >= endMinutes) {
      throw new Error('El horario está fuera del rango de atención del médico')
    }

    // @@unique([doctorLicense, scheduledAt]) in Prisma prevents duplicates at DB level
    try {
      return await this.appointmentRepository.create(input)
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new Error('Ese turno ya está ocupado')
      }
      throw err
    }
  }
}
