export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ABSENT'

export interface Appointment {
  id: number
  scheduledAt: Date
  status: AppointmentStatus
  patientDni: number
  doctorLicense: number
  specialtyId: number
  createdAt: Date
  updatedAt: Date
}
