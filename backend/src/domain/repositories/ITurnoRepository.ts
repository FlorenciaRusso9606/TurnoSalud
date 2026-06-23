import { Appointment, AppointmentStatus } from '../entities/Shift'

export interface ITurnoRepository {
  findById(id: number): Promise<Appointment | null>
  findByMedicoYFecha(matricula: number, fecha: Date): Promise<Appointment[]>
  findByPaciente(pacienteDni: number): Promise<Appointment[]>
  create(data: {
    scheduledAt: Date
    pacienteDni: number
    matriculaMedico: number
    especialidadId: number
  }): Promise<Appointment>
  updateStatus(id: number, status: AppointmentStatus): Promise<Appointment>
}