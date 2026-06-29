import { Request, Response } from 'express'
import { bookAppointmentSchema, appointmentIdParamSchema, changeStatusSchema, availableSlotsQuerySchema } from '../schemas/appointment.schemas'
import { BookAppointmentUseCase } from '../../../application/use-cases/BookAppointment'
import { CancelAppointmentUseCase } from '../../../application/use-cases/CancelAppointment'
import { ChangeAppointmentStatusUseCase } from '../../../application/use-cases/ChangeAppointmentStatus'
import { GetAvailableSlotsUseCase } from '../../../application/use-cases/GetAvailableSlots'
import { GetMyAppointmentsUseCase } from '../../../application/use-cases/GetMyAppointments'
import { GetDoctorAppointmentsUseCase } from '../../../application/use-cases/GetDoctorAppointments'
import { PrismaAppointmentRepository } from '../../../infrastructure/repositories/PrismaAppointmentRepository'
import { PrismaDoctorAvailabilityRepository } from '../../../infrastructure/repositories/PrismaDoctorAvailabilityRepository'
import prisma from '../../../prisma'
import { sendBookingConfirmation } from '../../../lib/email'

const appointmentRepo = new PrismaAppointmentRepository()
const availabilityRepo = new PrismaDoctorAvailabilityRepository()

const bookUseCase = new BookAppointmentUseCase(appointmentRepo, availabilityRepo)
const cancelUseCase = new CancelAppointmentUseCase(appointmentRepo)
const changeStatusUseCase = new ChangeAppointmentStatusUseCase(appointmentRepo)
const getAvailableUseCase = new GetAvailableSlotsUseCase(availabilityRepo, appointmentRepo)
const getMyAppointmentsUseCase = new GetMyAppointmentsUseCase(appointmentRepo)
const getDoctorAppointmentsUseCase = new GetDoctorAppointmentsUseCase(appointmentRepo)

// GET /appointments/available?specialtyId=1&date=2026-07-01
export const getAvailableSlots = async (req: Request, res: Response) => {
  const parsed = availableSlotsQuerySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const slots = await getAvailableUseCase.execute({
      specialtyId: parsed.data.specialtyId,
      date: new Date(parsed.data.date)
    })
    res.json(slots)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

// GET /appointments/doctor?range=today|week|month
export const getDoctorAppointments = async (req: Request, res: Response) => {
  const licenseNumber = req.user!.licenseNumber
  if (!licenseNumber) {
    res.status(400).json({ error: 'El usuario no tiene matrícula asignada' })
    return
  }

  const range = req.query.range as string
  if (!['today', 'week', 'month'].includes(range)) {
    res.status(422).json({ error: 'range debe ser today, week o month' })
    return
  }

  try {
    const appointments = await getDoctorAppointmentsUseCase.execute({
      licenseNumber,
      range: range as 'today' | 'week' | 'month',
    })
    res.json(appointments)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

// GET /appointments/mine
export const getMyAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await getMyAppointmentsUseCase.execute({
      patientDni: req.user!.dni
    })
    res.json(appointments)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

// POST /appointments
export const bookAppointment = async (req: Request, res: Response) => {
  const parsed = bookAppointmentSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const appointment = await bookUseCase.execute({
      patientDni: req.user!.dni,
      doctorLicense: parsed.data.doctorLicense,
      specialtyId: parsed.data.specialtyId,
      scheduledAt: new Date(parsed.data.scheduledAt)
    })
    res.status(201).json(appointment)

    // Email es best-effort: no bloquea la respuesta
    prisma.user.findUnique({ where: { dni: req.user!.dni }, select: { email: true, name: true, lastname: true } })
      .then(async user => {
        if (!user?.email) return
        const doc = await prisma.doctor.findUnique({
          where: { licenseNumber: parsed.data.doctorLicense },
          include: { user: { select: { name: true, lastname: true } }, specialty: { select: { name: true } } },
        })
        return sendBookingConfirmation({
          to:          user.email,
          patientName: `${user.name} ${user.lastname}`,
          doctorName:  doc ? `${doc.user.lastname}, ${doc.user.name}` : '',
          specialty:   doc?.specialty.name ?? '',
          scheduledAt: new Date(parsed.data.scheduledAt),
        })
      })
      .catch(err => console.error('Booking email failed:', err))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

// PATCH /appointments/:id/cancel
export const cancelAppointment = async (req: Request, res: Response) => {
  const parsed = appointmentIdParamSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ error: 'ID de turno inválido' })
    return
  }

  try {
    const appointment = await cancelUseCase.execute({
      appointmentId: parsed.data.id,
      patientDni: req.user!.dni
    })
    res.json(appointment)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

// GET /appointments/patient/:dni  - médico o admin ve turnos de un paciente
export const getPatientAppointments = async (req: Request, res: Response) => {
  const dni = parseInt(req.params.dni)
  if (isNaN(dni)) {
    res.status(400).json({ error: 'DNI inválido' })
    return
  }
  try {
    const appointments = await getMyAppointmentsUseCase.execute({ patientDni: dni })
    res.json(appointments)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

// GET /appointments/admin?range=today|week|month&status=PENDING|CONFIRMED|all&doctorLicense=123&patientDni=456
export const getAdminAppointments = async (req: Request, res: Response) => {
  const range         = req.query.range  as string
  const status        = req.query.status as string
  const doctorLicense = req.query.doctorLicense ? parseInt(req.query.doctorLicense as string) : undefined
  const patientDni    = req.query.patientDni    ? parseInt(req.query.patientDni    as string) : undefined

  if (!['today', 'week', 'month'].includes(range)) {
    res.status(422).json({ error: 'range debe ser today, week o month' })
    return
  }

  const now = new Date()
  let from: Date, to: Date

  if (range === 'today') {
    from = new Date(now); from.setUTCHours(0, 0, 0, 0)
    to   = new Date(now); to.setUTCHours(23, 59, 59, 999)
  } else if (range === 'week') {
    const day = now.getUTCDay()
    const diff = day === 0 ? -6 : 1 - day
    from = new Date(now); from.setUTCDate(now.getUTCDate() + diff); from.setUTCHours(0, 0, 0, 0)
    to   = new Date(from); to.setUTCDate(from.getUTCDate() + 6); to.setUTCHours(23, 59, 59, 999)
  } else {
    from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    to   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  }

  try {
    const rows = await prisma.appointment.findMany({
      where: {
        scheduledAt: { gte: from, lte: to },
        ...(status && status !== 'all' ? { status: status as any } : {}),
        ...(doctorLicense && !isNaN(doctorLicense) ? { doctorLicense } : {}),
        ...(patientDni    && !isNaN(patientDni)    ? { patientDni }    : {}),
      },
      include: {
        patient:  { include: { user: { select: { name: true, lastname: true } } } },
        doctor:   { include: { user: { select: { name: true, lastname: true } } } },
        specialty: { select: { name: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    res.json(rows.map(r => ({
      id:               r.id,
      scheduledAt:      r.scheduledAt,
      status:           r.status,
      patientDni:       r.patientDni,
      doctorLicense:    r.doctorLicense,
      specialtyId:      r.specialtyId,
      patientName:      r.patient.user.name,
      patientLastname:  r.patient.user.lastname,
      doctorName:       `${r.doctor.user.lastname}, ${r.doctor.user.name}`,
      specialtyName:    (r.specialty as any).name,
    })))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

// PATCH /appointments/:id/status  — médico o admin
export const changeAppointmentStatus = async (req: Request, res: Response) => {
  const paramParsed = appointmentIdParamSchema.safeParse(req.params)
  const bodyParsed = changeStatusSchema.safeParse(req.body)

  if (!paramParsed.success || !bodyParsed.success) {
    res.status(422).json({ error: 'Datos inválidos' })
    return
  }

  try {
    const appointment = await changeStatusUseCase.execute({
      appointmentId: paramParsed.data.id,
      newStatus: bodyParsed.data.status,
      role: req.user!.role as 'DOCTOR' | 'ADMIN'
    })
    res.json(appointment)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
