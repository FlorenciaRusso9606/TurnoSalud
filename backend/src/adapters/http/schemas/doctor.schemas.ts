import { z } from 'zod'

export const createDoctorSchema = z.object({
  dni:           z.number().int().positive(),
  name:          z.string().min(1),
  lastname:      z.string().min(1),
  licenseNumber: z.number().int().positive(),
  specialtyId:   z.number().int().positive(),
  password:      z.string().min(6),
})

export const updateDoctorSchema = z.object({
  specialtyId: z.number().int().positive().optional(),
})

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>
export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>
