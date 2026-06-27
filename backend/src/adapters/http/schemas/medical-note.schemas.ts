import { z } from 'zod'

export const createMedicalNoteSchema = z.object({
  patientDni: z.number().int().positive(),
  content:    z.string().min(1).max(2000),
})

export type CreateMedicalNoteInput = z.infer<typeof createMedicalNoteSchema>
