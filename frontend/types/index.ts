export type Role = 'PATIENT' | 'DOCTOR' | 'ADMIN'

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'ABSENT'

export interface User {
  id: number
  dni: number
  role: Role
}

export interface UserAdmin {
  id: number
  dni: number
  name: string
  lastname: string
  role: Role
  isActive: boolean
  email: string | null
  phone: string | null
  address: string | null
  createdAt: string
}

export interface Appointment {
  id: number
  scheduledAt: string
  status: AppointmentStatus
  patientDni: number
  doctorLicense: number
  specialtyId: number
  specialtyName?: string | null
  doctorName?: string | null
  patientName?: string | null
  patientLastname?: string | null
  patientSocialWork?: string | null
}

export interface Patient {
  dni: number
  name: string
  lastname: string
  birthDate: string
  socialWork: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
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

export interface RecordStudy {
  id: string
  title: string
  institution: string
  performedAt: string
  fileUrl: string
  studyTypeName: string | null
}

export interface RecordAppointment {
  id: number
  scheduledAt: string
  status: AppointmentStatus
  specialtyName: string | null
}

export interface MedicalNote {
  id: string
  content: string
  createdAt: string
  doctorLicense: number
  doctorName: string
  doctorLastname: string
}

export interface PatientRecord {
  patient: Patient
  notes: MedicalNote[]
  summary: {
    totalStudies: number
    totalAppointments: number
    totalNotes: number
    lastStudy: { id: string; title: string; performedAt: string } | null
    nextAppointment: RecordAppointment | null
  }
  studies: RecordStudy[]
  nextAppointment: RecordAppointment | null
  history: RecordAppointment[]
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

export interface DoctorAdmin {
  licenseNumber: number
  specialtyId: number
  specialtyName: string
  name: string
  lastname: string
  isActive: boolean
  email: string | null
  phone: string | null
}

export interface SpecialtyStat {
  specialtyId: number
  specialtyName: string
  total: number
  confirmed: number
  pending: number
  cancelled: number
  absent: number
}

export interface DoctorStat {
  licenseNumber: number
  doctorName: string
  specialtyName: string
  total: number
  confirmed: number
  pending: number
  cancelled: number
  absent: number
  absenteeismRate: number
}

export interface DashboardStats {
  range: 'today' | 'week' | 'month'
  from: string
  to: string
  kpis: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
    absent: number
    absenteeismRate: number
  }
  bySpecialty: SpecialtyStat[]
  byDoctor: DoctorStat[]
}

export interface DoctorAvailability {
  id: number
  licenseNumber: number
  date: string
  startTime: string
  endTime: string
  intervalMinutes: number
}
