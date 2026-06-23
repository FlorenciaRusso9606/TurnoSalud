import { z } from 'zod'

export const uploadSchema = z.object({
  patientDni: z.number().int().positive().min(7),
  title: z.string().min(1),
  description: z.string().optional(),
  fileUrl: z.string().url().optional(),
  date: z.coerce.date(),
})

// z.coerce.number() converts the string from req.params to number
export const patientDniParamSchema = z.object({
  dni: z.coerce.number().int().positive(),
})

export type UploadStudyInput = z.infer<typeof uploadSchema>
