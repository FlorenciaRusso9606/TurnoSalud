import { IDoctorAvailabilityRepository } from '../../domain/repositories/IDoctorAvailabilityRepository'
import { IAppointmentRepository } from '../../domain/repositories/IAppointmentRepository'

interface Input {
  specialtyId: number
  date: Date
}

interface AvailableSlot {
  doctorLicense: number
  doctorName: string
  scheduledAt: Date
}

function generateSlots(date: Date, startTime: string, endTime: string, intervalMinutes: number): Date[] {
  const slots: Date[] = []
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)

  const start = new Date(date)
  start.setHours(startH, startM, 0, 0)

  const end = new Date(date)
  end.setHours(endH, endM, 0, 0)

  const current = new Date(start)
  while (current < end) {
    slots.push(new Date(current))
    current.setMinutes(current.getMinutes() + intervalMinutes)
  }

  return slots
}

export class GetAvailableSlotsUseCase {
  constructor(
    private availabilityRepository: IDoctorAvailabilityRepository,
    private appointmentRepository: IAppointmentRepository
  ) {}

  async execute(input: Input): Promise<AvailableSlot[]> {
    const availabilities = await this.availabilityRepository.findBySpecialtyAndDate(
      input.specialtyId,
      input.date
    )

    if (availabilities.length === 0) return []

    const result: AvailableSlot[] = []

    for (const availability of availabilities) {
      const slots = generateSlots(
        input.date,
        availability.startTime,
        availability.endTime,
        availability.intervalMinutes
      )

      const booked = await this.appointmentRepository.findByDoctorAndDate(
        availability.licenseNumber,
        input.date
      )

      const bookedSlots = new Set(
        booked
          .filter(a => a.status !== 'CANCELLED')
          .map(a => a.scheduledAt.getTime())
      )

      for (const slot of slots.filter(s => !bookedSlots.has(s.getTime()))) {
        result.push({
          doctorLicense: availability.licenseNumber,
          doctorName: `Doctor ${availability.licenseNumber}`, // enriched in controller
          scheduledAt: slot,
        })
      }
    }

    return result
  }
}
