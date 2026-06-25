import { BookAppointmentUseCase } from './application/use-cases/BookAppointment'
import { CancelAppointmentUseCase } from './application/use-cases/CancelAppointment'
import { ChangeAppointmentStatusUseCase } from './application/use-cases/ChangeAppointmentStatus'
import { GetAvailableSlotsUseCase } from './application/use-cases/GetAvailableSlots'
import { GetMyAppointmentsUseCase } from './application/use-cases/GetMyAppointments'
import { GetPatientStudiesUseCase } from './application/use-cases/GetPatientStudies'
import { UploadStudyUseCase } from './application/use-cases/UploadStudy'

import { IAppointmentRepository } from './domain/repositories/IAppointmentRepository'
import { IDoctorAvailabilityRepository } from './domain/repositories/IDoctorAvailabilityRepository'
import { IStudyRepository } from './domain/repositories/IStudyRepository'

import { Appointment, AppointmentStatus } from './domain/entities/Appointment'
import { DoctorAvailability } from './domain/entities/DoctorAvailability'
import { Study } from './domain/entities/Study'

// ─────────────────────────────────────────
// MOCKS
// ─────────────────────────────────────────

const makeAppointmentRepo = (appointments: Appointment[] = []): IAppointmentRepository => ({
  findById: async (id) => appointments.find(a => a.id === id) ?? null,
  findByDoctorAndDate: async (license, date) =>
    appointments.filter(a => {
      const sameDoctor = a.doctorLicense === license
const sameDay = a.scheduledAt.toLocaleDateString() === date.toLocaleDateString()
      return sameDoctor && sameDay
    }),
  findByDoctor: async (license, from, to) =>
    appointments.filter(a => a.doctorLicense === license && a.scheduledAt >= from && a.scheduledAt <= to),
  findByPatient: async (dni) => appointments.filter(a => a.patientDni === dni),
  create: async (data) => ({
    id: appointments.length + 1,
    ...data,
    status: 'PENDING' as AppointmentStatus,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateStatus: async (id, status) => {
    const appointment = appointments.find(a => a.id === id)
    if (!appointment) throw new Error('Turno no encontrado')
    appointment.status = status
    return appointment
  },
})

const makeAvailabilityRepo = (availabilities: DoctorAvailability[] = []): IDoctorAvailabilityRepository => ({
  findByDoctorAndDate: async (license, date) =>
    availabilities.find(a => {
      const sameDoctor = a.licenseNumber === license
      const sameDay = a.date.toDateString() === date.toDateString()
      return sameDoctor && sameDay
    }) ?? null,
  findBySpecialtyAndDate: async (specialtyId, date) =>
    availabilities.filter(a => a.date.toDateString() === date.toDateString()),
  create: async (data) => ({ id: 1, intervalMinutes: 30, ...data }),
})

const makeStudyRepo = (studies: Study[] = []): IStudyRepository => ({
  findByPatient: async (dni) => studies.filter(s => s.patientDni === dni),
  create: async (data) => ({
    id: `study-${studies.length + 1}`,
    description: null,
    createdAt: new Date(),
    ...data,
  }),
})

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const makeAvailability = (license: number, date: Date): DoctorAvailability => ({
  id: 1,
  licenseNumber: license,
  date,
  startTime: '08:00',
  endTime: '12:00',
  intervalMinutes: 30,
})

const makeAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
  id: 1,
  scheduledAt: new Date('2026-07-01T08:00:00'),
  status: 'PENDING',
  patientDni: 12345678,
  doctorLicense: 9999,
  specialtyId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// ─────────────────────────────────────────
// BookAppointmentUseCase
// ─────────────────────────────────────────

describe('BookAppointmentUseCase', () => {
  const date = new Date('2026-07-01T08:00:00')
  const license = 9999
  const availability = makeAvailability(license, date)

  it('crea un turno en un slot válido', async () => {
    const appointmentRepo = makeAppointmentRepo()
    const availabilityRepo = makeAvailabilityRepo([availability])
    const useCase = new BookAppointmentUseCase(appointmentRepo, availabilityRepo)

    const result = await useCase.execute({
      patientDni: 12345678,
      doctorLicense: license,
      specialtyId: 1,
      scheduledAt: date,
    })

    expect(result.status).toBe('PENDING')
    expect(result.doctorLicense).toBe(license)
  })

  it('lanza error si el médico no tiene disponibilidad ese día', async () => {
    const appointmentRepo = makeAppointmentRepo()
    const availabilityRepo = makeAvailabilityRepo([]) // sin disponibilidad
    const useCase = new BookAppointmentUseCase(appointmentRepo, availabilityRepo)

    await expect(
      useCase.execute({
        patientDni: 12345678,
        doctorLicense: license,
        specialtyId: 1,
        scheduledAt: date,
      })
    ).rejects.toThrow('El médico no tiene disponibilidad para esa fecha')
  })

  it('lanza error si el horario está fuera del rango de atención', async () => {
    const appointmentRepo = makeAppointmentRepo()
    const availabilityRepo = makeAvailabilityRepo([availability])
    const useCase = new BookAppointmentUseCase(appointmentRepo, availabilityRepo)

    await expect(
      useCase.execute({
        patientDni: 12345678,
        doctorLicense: license,
        specialtyId: 1,
        scheduledAt: new Date('2026-07-01T14:00:00'), // fuera de 08:00-12:00
      })
    ).rejects.toThrow('El horario está fuera del rango de atención del médico')
  })
})

// ─────────────────────────────────────────
// CancelAppointmentUseCase
// ─────────────────────────────────────────

describe('CancelAppointmentUseCase', () => {
  it('cancela un turno PENDING del paciente', async () => {
    const appointment = makeAppointment({ id: 1, status: 'PENDING', patientDni: 12345678 })
    const repo = makeAppointmentRepo([appointment])
    const useCase = new CancelAppointmentUseCase(repo)

    const result = await useCase.execute({ appointmentId: 1, patientDni: 12345678 })
    expect(result.status).toBe('CANCELLED')
  })

  it('lanza error si el turno no pertenece al paciente', async () => {
    const appointment = makeAppointment({ id: 1, patientDni: 99999999 })
    const repo = makeAppointmentRepo([appointment])
    const useCase = new CancelAppointmentUseCase(repo)

    await expect(
      useCase.execute({ appointmentId: 1, patientDni: 12345678 })
    ).rejects.toThrow()
  })

  it('lanza error si el turno ya está cancelado', async () => {
    const appointment = makeAppointment({ id: 1, status: 'CANCELLED', patientDni: 12345678 })
    const repo = makeAppointmentRepo([appointment])
    const useCase = new CancelAppointmentUseCase(repo)

    await expect(
      useCase.execute({ appointmentId: 1, patientDni: 12345678 })
    ).rejects.toThrow()
  })
})

// ─────────────────────────────────────────
// ChangeAppointmentStatusUseCase
// ─────────────────────────────────────────

describe('ChangeAppointmentStatusUseCase', () => {
  it('confirma un turno PENDING', async () => {
    const appointment = makeAppointment({ id: 1, status: 'PENDING' })
    const repo = makeAppointmentRepo([appointment])
    const useCase = new ChangeAppointmentStatusUseCase(repo)

    const result = await useCase.execute({ appointmentId: 1, newStatus: 'CONFIRMED', role: 'DOCTOR' })
    expect(result.status).toBe('CONFIRMED')
  })

  it('marca como ABSENT un turno CONFIRMED', async () => {
    const appointment = makeAppointment({ id: 1, status: 'CONFIRMED' })
    const repo = makeAppointmentRepo([appointment])
    const useCase = new ChangeAppointmentStatusUseCase(repo)

    const result = await useCase.execute({ appointmentId: 1, newStatus: 'ABSENT', role: 'DOCTOR' })
    expect(result.status).toBe('ABSENT')
  })

  it('lanza error en transición inválida', async () => {
    const appointment = makeAppointment({ id: 1, status: 'CANCELLED' })
    const repo = makeAppointmentRepo([appointment])
    const useCase = new ChangeAppointmentStatusUseCase(repo)

    await expect(
      useCase.execute({ appointmentId: 1, newStatus: 'CONFIRMED', role: 'ADMIN' })
    ).rejects.toThrow()
  })
})

// ─────────────────────────────────────────
// GetAvailableSlotsUseCase
// ─────────────────────────────────────────

describe('GetAvailableSlotsUseCase', () => {
  it('devuelve slots libres descontando los ocupados', async () => {
    const date = new Date('2026-07-01T00:00:00')
    const license = 9999
    const availability = makeAvailability(license, date)

    // Un turno ya ocupado a las 08:00
    const occupiedAppointment = makeAppointment({
      doctorLicense: license,
      scheduledAt: new Date('2026-07-01T08:00:00'),
      status: 'PENDING',
    })

    const appointmentRepo = makeAppointmentRepo([occupiedAppointment])
    const availabilityRepo = makeAvailabilityRepo([availability])
    const useCase = new GetAvailableSlotsUseCase(availabilityRepo, appointmentRepo)

    const slots = await useCase.execute({ specialtyId: 1, date })

    // 08:00-12:00 cada 30min = 8 slots totales, 1 ocupado y 7 libres
    expect(slots.length).toBe(8)
    const occupied = slots.filter(s => s.booked)
    const free     = slots.filter(s => !s.booked)
    expect(occupied).toHaveLength(1)
    expect(free).toHaveLength(7)
    expect(occupied[0].scheduledAt.getHours() * 60 + occupied[0].scheduledAt.getMinutes()).toBe(8 * 60)
  })

  it('devuelve array vacío si no hay disponibilidad', async () => {
    const appointmentRepo = makeAppointmentRepo()
    const availabilityRepo = makeAvailabilityRepo([])
    const useCase = new GetAvailableSlotsUseCase(availabilityRepo, appointmentRepo)

    const slots = await useCase.execute({ specialtyId: 1, date: new Date('2026-07-01T00:00:00') })
    expect(slots).toHaveLength(0)
  })
})

// ─────────────────────────────────────────
// GetMyAppointmentsUseCase
// ─────────────────────────────────────────

describe('GetMyAppointmentsUseCase', () => {
  it('devuelve los turnos del paciente', async () => {
    const appointments = [
      makeAppointment({ id: 1, patientDni: 12345678 }),
      makeAppointment({ id: 2, patientDni: 12345678 }),
      makeAppointment({ id: 3, patientDni: 99999999 }), // de otro paciente
    ]
    const repo = makeAppointmentRepo(appointments)
    const useCase = new GetMyAppointmentsUseCase(repo)

    const result = await useCase.execute({ patientDni: 12345678 })
    expect(result).toHaveLength(2)
    expect(result.every(a => a.patientDni === 12345678)).toBe(true)
  })

  it('devuelve array vacío si el paciente no tiene turnos', async () => {
    const repo = makeAppointmentRepo([])
    const useCase = new GetMyAppointmentsUseCase(repo)

    const result = await useCase.execute({ patientDni: 12345678 })
    expect(result).toHaveLength(0)
  })
})

// ─────────────────────────────────────────
// GetPatientStudiesUseCase
// ─────────────────────────────────────────

describe('GetPatientStudiesUseCase', () => {
  it('devuelve los estudios del paciente ordenados', async () => {
    const studies: Study[] = [
      { id: 'uuid-1', patientDni: 12345678, studyTypeId: 1, title: 'Hemograma', description: null, institution: 'Lab Central', fileUrl: 'https://s3.example.com/1.pdf', performedAt: new Date('2026-06-01'), responsibleDoctorLicense: 9999, createdBy: 1, createdAt: new Date() },
      { id: 'uuid-2', patientDni: 12345678, studyTypeId: 4, title: 'Rx Tórax', description: null, institution: 'Clínica Norte', fileUrl: 'https://s3.example.com/2.pdf', performedAt: new Date('2026-05-01'), responsibleDoctorLicense: 9999, createdBy: 1, createdAt: new Date() },
    ]
    const repo = makeStudyRepo(studies)
    const useCase = new GetPatientStudiesUseCase(repo)

    const result = await useCase.execute({ patientDni: 12345678 })
    expect(result).toHaveLength(2)
    expect(result.every(s => s.patientDni === 12345678)).toBe(true)
  })
})

// ─────────────────────────────────────────
// UploadStudyUseCase
// ─────────────────────────────────────────

describe('UploadStudyUseCase', () => {
  it('crea un estudio con los datos correctos', async () => {
    const repo = makeStudyRepo()
    const useCase = new UploadStudyUseCase(repo)

    const result = await useCase.execute({
      patientDni: 12345678,
      studyTypeId: 1,
      title: 'Hemograma',
      description: 'Resultado normal',
      institution: 'Lab Central',
      fileUrl: 'https://s3.amazonaws.com/turnosalud/hemograma.pdf',
      performedAt: new Date('2026-06-23'),
      responsibleDoctorLicense: 9999,
      uploadedByUserId: 1,
    })

    expect(result.title).toBe('Hemograma')
    expect(result.patientDni).toBe(12345678)
    expect(result.fileUrl).toBe('https://s3.amazonaws.com/turnosalud/hemograma.pdf')
  })
})
