export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ABSENT'

export interface User {
  id: number
  dni: number
  role: Role
}

export interface Appointment {
  id: number
  scheduledAt: string
  status: AppointmentStatus
  patientDni: number
  doctorLicense: number
  specialtyId: number
}

export interface Patient {
  dni: number
  name: string
  lastname: string
  birthDate: string
  socialWork: string | null
}

export interface StudyType {
  id: number
  name: string
}

export interface Study {
  id: string
  patientDni: number
  studyTypeId: number
  title: string
  description: string | null
  institution: string
  fileUrl: string
  performedAt: string
  responsibleDoctorLicense: number
  createdBy: number
  createdAt: string
}

export interface AvailableSlot {
  doctorLicense: number
  doctorName: string
  scheduledAt: string
  booked: boolean
}

export interface Specialty {
  id: number
  name: string
}

export interface Doctor {
  licenseNumber: number
  name: string
  lastname: string
}

export interface DoctorDetail extends Doctor {
  specialty: { name: string }
}

export interface DoctorAvailability {
  id: number
  licenseNumber: number
  date: string
  startTime: string
  endTime: string
  intervalMinutes: number
}