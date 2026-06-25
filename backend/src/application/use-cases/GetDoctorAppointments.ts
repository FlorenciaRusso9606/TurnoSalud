import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'
import { Appointment } from '../../domain/entities/Appointment'

type Range = 'today' | 'week' | 'month'

interface Input {
  licenseNumber: number
  range: Range
}

function getRangeBounds(range: Range): { from: Date; to: Date } {
  const now = new Date()

  if (range === 'today') {
    const from = new Date(now); from.setHours(0, 0, 0, 0)
    const to   = new Date(now); to.setHours(23, 59, 59, 999)
    return { from, to }
  }

  if (range === 'week') {
    const day = now.getDay()
    const diffToMonday = (day === 0 ? -6 : 1 - day)
    const from = new Date(now)
    from.setDate(now.getDate() + diffToMonday)
    from.setHours(0, 0, 0, 0)
    const to = new Date(from)
    to.setDate(from.getDate() + 6)
    to.setHours(23, 59, 59, 999)
    return { from, to }
  }

  // month
  const from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { from, to }
}

export class GetDoctorAppointmentsUseCase {
  constructor(private appointmentRepository: IAppointmentRepository) {}

  async execute(input: Input): Promise<Appointment[]> {
    const { from, to } = getRangeBounds(input.range)
    return this.appointmentRepository.findByDoctor(input.licenseNumber, from, to)
  }
}
