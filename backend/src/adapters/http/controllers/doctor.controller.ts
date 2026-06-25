import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../../prisma'

const querySchema = z.object({
  specialtyId: z.coerce.number().int().positive(),
})

export const getDoctorsBySpecialty = async (req: Request, res: Response) => {
  const parsed = querySchema.safeParse(req.query)
  if (!parsed.success) {
    res.status(422).json({ error: 'specialtyId inválido' })
    return
  }

  try {
    const doctors = await prisma.doctor.findMany({
      where: { specialtyId: parsed.data.specialtyId },
      select: {
        licenseNumber: true,
        user: { select: { name: true, lastname: true } },
      },
      orderBy: { user: { lastname: 'asc' } },
    })
    res.json(
      doctors.map((d) => ({
        licenseNumber: d.licenseNumber,
        name: d.user?.name ?? '',
        lastname: d.user?.lastname ?? '',
      }))
    )
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const searchDoctors = async (req: Request, res: Response) => {
  const q = String(req.query.q ?? '').trim()
  if (!q) {
    res.status(422).json({ error: 'Parámetro q requerido' })
    return
  }

  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        user: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { lastname: { contains: q, mode: 'insensitive' } },
          ],
        },
      },
      select: {
        licenseNumber: true,
        user: { select: { name: true, lastname: true } },
        specialty: { select: { name: true } },
      },
      orderBy: { user: { lastname: 'asc' } },
      take: 10,
    })
    res.json(
      doctors.map((d) => ({
        licenseNumber: d.licenseNumber,
        name: d.user?.name ?? '',
        lastname: d.user?.lastname ?? '',
        specialty: d.specialty,
      }))
    )
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getDoctorByLicense = async (req: Request, res: Response) => {
  const licenseNumber = parseInt(req.params.licenseNumber)
  if (isNaN(licenseNumber)) {
    res.status(422).json({ error: 'Matrícula inválida' })
    return
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { licenseNumber },
      select: {
        licenseNumber: true,
        user: { select: { name: true, lastname: true } },
        specialty: { select: { name: true } },
      },
    })
    if (!doctor) {
      res.status(404).json({ error: 'Médico no encontrado' })
      return
    }
    res.json({
      licenseNumber: doctor.licenseNumber,
      name: doctor.user?.name ?? '',
      lastname: doctor.user?.lastname ?? '',
      specialty: doctor.specialty,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
