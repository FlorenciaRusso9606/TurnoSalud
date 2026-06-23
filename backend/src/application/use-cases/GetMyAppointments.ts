import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'
import { Appointment } from '../../domain/entities/Appointment'

interface Input {
  patientDni: number
}

export class GetMyAppointmentsUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: Input): Promise<Appointment[]> {
    return this.appointmentRepository.findByPatient(input.patientDni)
  }
}
