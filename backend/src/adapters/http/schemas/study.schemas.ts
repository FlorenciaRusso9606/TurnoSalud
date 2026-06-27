import { z } from 'zod'

export const uploadSchema = z.object({
  patientDni:               z.coerce.number().int().positive('DNI inválido'),
  studyTypeId:              z.coerce.number().int().positive('Tipo de estudio requerido'),
  title:                    z.string().min(1, 'El título es requerido'),
  description:              z.string().optional(),
  institution:              z.string().min(1, 'La institución es requerida'),
  performedAt:              z.coerce.date(),
  responsibleDoctorLicense: z.coerce.number().int().positive('Profesional responsable requerido'),
})

export const patientDniParamSchema = z.object({
  dni: z.coerce.number().int().positive(),
})

export const studyIdParamSchema = z.object({
  studyId: z.string().uuid('ID de estudio inválido'),
})

export type UploadStudyInput = z.infer<typeof uploadSchema>
