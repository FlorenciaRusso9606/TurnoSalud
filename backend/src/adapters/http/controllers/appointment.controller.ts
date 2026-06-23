import { Request, Response } from 'express'
import { bookAppointmentSchema, appointmentIdParamSchema, changeStatusSchema, availableSlotsQuerySchema } from '../schemas/appointment.schemas'
import { BookAppointmentUseCase } from '../../../application/use-cases/BookAppointment'
import { CancelAppointmentUseCase } from '../../../application/use-cases/CancelAppointment'
import { ChangeAppointmentStatusUseCase } from '../../../application/use-cases/ChangeAppointmentStatus'
import { GetAvailableSlotsUseCase } from '../../../application/use-cases/GetAvailableSlots'
import { GetMyAppointmentsUseCase } from '../../../application/use-cases/GetMyAppointments'
import { PrismaAppointmentRepository } from '../../../infrastructure/repositories/PrismaAppointmentRepository'
import { PrismaDoctorAvailabilityRepository } from '../../../infrastructure/repositories/PrismaDoctorAvailabilityRepository'

const appointmentRepo = new PrismaAppointmentRepository()
const availabilityRepo = new PrismaDoctorAvailabilityRepository()

const bookUseCase = new BookAppointmentUseCase(appointmentRepo, availabilityRepo)
const cancelUseCase = new CancelAppointmentUseCase(appointmentRepo)
const changeStatusUseCase = new ChangeAppointmentStatusUseCase(appointmentRepo)
const getAvailableUseCase = new GetAvailableSlotsUseCase(availabilityRepo, appointmentRepo)
const getMyAppointmentsUseCase = new GetMyAppointmentsUseCase(appointmentRepo)

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
