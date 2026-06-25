import { Request, Response } from 'express'
import prisma from '../../../prisma'

export const getAllPatients = async (_req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        dni: true,
        birthDate: true,
        socialWork: true,
        user: { select: { name: true, lastname: true } },
      },
      orderBy: { user: { lastname: 'asc' } },
    })
    res.json(patients.map(p => ({
      dni: p.dni,
      name: p.user.name,
      lastname: p.user.lastname,
      birthDate: p.birthDate,
      socialWork: p.socialWork,
    })))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const searchPatients = async (req: Request, res: Response) => {
  const q = String(req.query.q ?? '').trim()
  if (!q) {
    res.status(422).json({ error: 'Parámetro q requerido' })
    return
  }

  try {
    const isNumeric = /^\d+$/.test(q)
    const patients = await prisma.patient.findMany({
      where: isNumeric
        ? { dni: { equals: parseInt(q) } }
        : {
            user: {
              OR: [
                { name: { contains: q, mode: 'insensitive' } },
                { lastname: { contains: q, mode: 'insensitive' } },
              ],
            },
          },
      select: {
        dni: true,
        birthDate: true,
        socialWork: true,
        user: { select: { name: true, lastname: true } },
      },
      orderBy: { user: { lastname: 'asc' } },
      take: 10,
    })
    res.json(
      patients.map(p => ({
        dni: p.dni,
        name: p.user.name,
        lastname: p.user.lastname,
        birthDate: p.birthDate,
        socialWork: p.socialWork,
      }))
    )
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
