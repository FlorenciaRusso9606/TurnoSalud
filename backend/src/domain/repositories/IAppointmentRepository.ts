import { Appointment, AppointmentStatus } from '../entities/Appointment'

export interface IAppointmentRepository {
  findById(id: number): Promise<Appointment | null>
  findByDoctorAndDate(licenseNumber: number, date: Date): Promise<Appointment[]>
  findByPatient(patientDni: number): Promise<Appointment[]>
  create(data: {
    scheduledAt: Date
    patientDni: number
    doctorLicense: number
    specialtyId: number
  }): Promise<Appointment>
  updateStatus(id: number, status: AppointmentStatus): Promise<Appointment>
}
