import { z } from 'zod'
export const registerSchema = z.object({
  dni: z.number().int().positive(),
  password: z.string().min(6),
  name: z.string().min(2),
  lastname: z.string().min(2),
  socialWork: z.string().optional()
})

export const loginSchema = z.object({
  dni: z.number().int().positive(),
  password: z.string().min(1)
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
 