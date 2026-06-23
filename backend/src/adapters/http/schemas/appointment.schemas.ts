import { z } from 'zod'

export const bookAppointmentSchema = z.object({
  doctorLicense: z.number().int().positive(),
  specialtyId: z.number().int().positive(),
  scheduledAt: z.string().datetime()
})

export const appointmentIdParamSchema = z.object({
  id: z.coerce.number().int().positive()
})

export const changeStatusSchema = z.object({
  status: z.enum(['CONFIRMED', 'CANCELLED', 'ABSENT'])
})

export const availableSlotsQuerySchema = z.object({
  specialtyId: z.coerce.number().int().positive(),
  date: z.string().date()
})

export type BookAppointmentInput = z.infer<typeof bookAppointmentSchema>
