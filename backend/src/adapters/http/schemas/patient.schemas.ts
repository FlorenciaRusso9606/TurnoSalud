import { z } from 'zod'

export const createPatientSchema = z.object({
  dni:        z.number().int().positive(),
  name:       z.string().min(1),
  lastname:   z.string().min(1),
  birthDate:  z.string().min(1),
  password:   z.string().min(6),
  socialWork: z.string().optional(),
  email:      z.string().email().optional(),
  phone:      z.string().optional(),
  address:    z.string().optional(),
})

export const updatePatientSchema = z.object({
  socialWork: z.string().nullable().optional(),
  email:      z.string().email().nullable().optional(),
  phone:      z.string().nullable().optional(),
  address:    z.string().nullable().optional(),
})

export type CreatePatientInput = z.infer<typeof createPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>
