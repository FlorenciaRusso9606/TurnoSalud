import { ITurnoRepository } from '../../domain/repositories/ITurnoRepository'
import { Appointment } from '../../domain/entities/Shift'

interface Input {
  pacienteDni: number
}

export class GetMisTurnosUseCase {
  constructor(private turnoRepository: ITurnoRepository) {}

  async execute(input: Input): Promise<Appointment[]> {
    return this.turnoRepository.findByPaciente(input.pacienteDni)
  }
}
