import { z } from 'zod'

export const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  email:    z.string().email().nullable().optional(),
  phone:    z.string().nullable().optional(),
  address:  z.string().nullable().optional(),
  password: z.string().min(6).optional(),
})

export type UpdateUserInput = z.infer<typeof updateUserSchema>
