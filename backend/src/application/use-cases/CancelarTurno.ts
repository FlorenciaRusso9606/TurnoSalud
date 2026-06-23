import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'
import { Appointment } from '../../domain/entities/Appointment'

interface Input {
  appointmentId: number
  patientDni: number
}

export class CancelAppointmentUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: Input): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(input.appointmentId)

    if (!appointment) {
      throw new Error('Turno no encontrado')
    }

    if (appointment.patientDni !== input.patientDni) {
      throw new Error('No tenés permiso para cancelar este turno')
    }

    if (appointment.status === 'CANCELLED') {
      throw new Error('El turno ya está cancelado')
    }

    if (appointment.status === 'ABSENT') {
      throw new Error('No se puede cancelar un turno marcado como ausente')
    }

    return this.appointmentRepository.updateStatus(input.appointmentId, 'CANCELLED')
  }
}
