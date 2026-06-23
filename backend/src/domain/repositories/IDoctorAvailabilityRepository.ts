import { DoctorAvailability } from '../entities/DoctorAvailability'

export interface IDoctorAvailabilityRepository {
  findByDoctorAndDate(licenseNumber: number, date: Date): Promise<DoctorAvailability | null>
  findBySpecialtyAndDate(specialtyId: number, date: Date): Promise<DoctorAvailability[]>
  create(data: {
    licenseNumber: number
    date: Date
    startTime: string
    endTime: string
    intervalMinutes?: number
  }): Promise<DoctorAvailability>
}
