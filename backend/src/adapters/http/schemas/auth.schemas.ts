import { z } from 'zod'
export const registerSchema = z.object({
  dni: z.number().int().positive(),
  password: z.string().min(6),
  name: z.string().min(2),
  lastname: z.string().min(2),
  birthDate: z.string().date().refine(
    d => {
      const date = new Date(d)
      return date >= new Date('1920-01-01') && date < new Date()
    },
    { message: 'La fecha de nacimiento debe ser válida y no puede ser futura' }
  ),
  socialWork: z.string().optional()
})

export const loginSchema = z.object({
  dni: z.number().int().positive(),
  password: z.string().min(1)
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
 