import { ITurnoRepository } from '../../domain/repositories/ITurnoRepository'
import { Appointment, AppointmentStatus } from '../../domain/entities/Shift'

interface Input {
  turnoId: number
  nuevoStatus: AppointmentStatus
  role: 'DOCTOR' | 'ADMIN'
}

const TRANSICIONES_VALIDAS: Record<AppointmentStatus, AppointmentStatus[]> = {
  PENDING:  ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['ABSENT', 'CANCELLED'],
  CANCELLED:  [],
  ABSENT:    []
}

export class CambiarStatusTurnoUseCase {
  constructor(private turnoRepository: ITurnoRepository) {}

  async execute(input: Input): Promise<Appointment> {
    const turno = await this.turnoRepository.findById(input.turnoId)

    if (!turno) {
      throw new Error('Turno no encontrado')
    }

    const transicionesPermitidas = TRANSICIONES_VALIDAS[turno.status]
    if (!transicionesPermitidas.includes(input.nuevoStatus)) {
      throw new Error(
        `No se puede cambiar de ${turno.status} a ${input.nuevoStatus}`
      )
    }

    return this.turnoRepository.updateStatus(input.turnoId, input.nuevoStatus)
  }
}
