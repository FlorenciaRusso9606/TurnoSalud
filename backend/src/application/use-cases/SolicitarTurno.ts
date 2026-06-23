import { ITurnoRepository } from '../../domain/repositories/ITurnoRepository'
import { IDoctorAvailabilityRepository } from '../../domain/repositories/IDoctorAvailabilityRepository'
import { Appointment, AppointmentStatus } from '../../domain/entities/Shift'

interface Input {
  pacienteDni: number
  matriculaMedico: number
  especialidadId: number
  scheduledAt: Date
}

export class SolicitarTurnoUseCase {
  constructor(
    private turnoRepository: ITurnoRepository,
    private disponibilidadRepository: IDoctorAvailabilityRepository
  ) {}

  async execute(input: Input): Promise<Appointment> {
    // Verificar que el médico tiene disponibilidad ese día
    const disponibilidad = await this.disponibilidadRepository.findByDoctorAndDate(
      input.matriculaMedico,
      input.scheduledAt
    )
    if (!disponibilidad) {
      throw new Error('El médico no tiene disponibilidad para esa fecha')
    }

    // Verificar que el slot está dentro del rango de atención
    const [hIni, mIni] = disponibilidad.startTime.split(':').map(Number)
    const [hFin, mFin] = disponibilidad.endTime.split(':').map(Number)
    const horaSlot = input.scheduledAt.getHours() * 60 + input.scheduledAt.getMinutes()
    const horaInicio = hIni * 60 + mIni
    const horaFin = hFin * 60 + mFin

    if (horaSlot < horaInicio || horaSlot >= horaFin) {
      throw new Error('El horario está fuera del rango de atención del médico')
    }

  
    try {
      return await this.turnoRepository.create(input)
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw new Error('Ese turno ya está ocupado')
      }
      throw err
    }
  }
}
