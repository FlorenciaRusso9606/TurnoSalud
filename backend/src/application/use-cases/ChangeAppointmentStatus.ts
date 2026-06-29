import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'
import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment'

interface Input {
  appointmentId: number
  newStatus: AppointmentStatus
  role: 'DOCTOR' | 'ADMIN'
}

const VALID_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING:   ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ABSENT', 'CANCELLED'],
  CANCELLED: [],
  ABSENT:    [],
}

const ROLE_ALLOWED: Record<'DOCTOR' | 'ADMIN', AppointmentStatus[]> = {
  DOCTOR: ['ABSENT'],
  ADMIN:  ['CONFIRMED', 'CANCELLED'],
}

export class ChangeAppointmentStatusUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: Input): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId)

    if (!appointment) {
      throw new Error('Turno no encontrado')
    }

    if (!ROLE_ALLOWED[input.role].includes(input.newStatus)) {
      throw new Error('Sin permisos para esta acción')
    }

    const allowedTransitions = VALID_TRANSITIONS[appointment.status]
    if (!allowedTransitions.includes(input.newStatus)) {
      throw new Error(`No se puede cambiar de ${appointment.status} a ${input.newStatus}`)
    }

    return this.appointmentRepository.updateStatus(input.appointmentId, input.newStatus)
  }
}
