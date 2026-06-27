import { Request, Response } from 'express'
import prisma from '../../../prisma'
import { createMedicalNoteSchema } from '../schemas/medical-note.schemas'

export const createMedicalNote = async (req: Request, res: Response) => {
  const parsed = createMedicalNoteSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
    return
  }

  const doctorLicense = req.user?.licenseNumber
  if (!doctorLicense) {
    res.status(403).json({ error: 'Solo médicos pueden crear notas clínicas' })
    return
  }

  try {
    const note = await prisma.medicalNote.create({
      data: {
        patientDni: parsed.data.patientDni,
        doctorLicense,
        content: parsed.data.content,
      },
      include: {
        doctor: { select: { user: { select: { name: true, lastname: true } } } },
      },
    })

    res.status(201).json({
      id: note.id,
      content: note.content,
      createdAt: note.createdAt,
      doctorLicense: note.doctorLicense,
      doctorName: note.doctor.user.name,
      doctorLastname: note.doctor.user.lastname,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
