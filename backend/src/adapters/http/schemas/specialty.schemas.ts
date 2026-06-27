import { z } from 'zod'

export const specialtyNameSchema = z.object({
  name: z.string().min(1).max(100),
})

export type SpecialtyNameInput = z.infer<typeof specialtyNameSchema>
