import { z } from 'zod'

export const loginSchema = z.object({
  dni: z.coerce
    .number({ error: 'El DNI debe ser un número' })
    .positive('El DNI debe ser un número positivo'),
  password: z.string().min(1, 'La contraseña es requerida'),
})

export const registerSchema = z
  .object({
    name:       z.string().min(1, 'El nombre es requerido'),
    lastname:   z.string().min(1, 'El apellido es requerido'),
    dni:        z.coerce.number({ error: 'El DNI debe ser un número' }).positive('El DNI debe ser positivo'),
    birthDate:  z.string().min(1, 'La fecha de nacimiento es requerida').refine(
      d => {
        const date = new Date(d)
        return date >= new Date('1920-01-01') && date < new Date()
      },
      { message: 'La fecha de nacimiento no puede ser futura ni anterior a 1920' }
    ),
    socialWork: z.string().optional(),
    password:   z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirm:    z.string(),
  })
  .refine(data => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

export const availabilitySchema = z
  .object({
    licenseNumber:   z.coerce.number({ error: 'Ingresá una matrícula válida' }).positive('La matrícula debe ser positiva'),
    date:            z.string().min(1, 'La fecha es requerida'),
    startTime:       z.string().min(1, 'La hora de inicio es requerida'),
    endTime:         z.string().min(1, 'La hora de fin es requerida'),
    intervalMinutes: z.coerce.number().int().positive(),
  })
  .refine(data => data.startTime < data.endTime, {
    message: 'La hora de inicio debe ser anterior a la de fin',
    path: ['endTime'],
  })

export const studyUploadSchema = z.object({
  patientDni:               z.number({ message: 'Seleccioná un paciente' }).int().positive(),
  studyTypeId:              z.number({ message: 'Seleccioná un tipo de estudio' }).int().positive(),
  title:                    z.string().min(1, 'El título es requerido'),
  description:              z.string().optional(),
  institution:              z.string().min(1, 'La institución es requerida'),
  performedAt:              z.string().min(1, 'La fecha de realización es requerida'),
  responsibleDoctorLicense: z.number({ message: 'Seleccioná el profesional responsable' }).int().positive(),
})
