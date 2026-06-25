import { Request, Response } from 'express'
import prisma from '../../../prisma'

export const getAllSpecialties = async (_req: Request, res: Response) => {
  try {
    const specialties = await prisma.specialty.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    })
    res.json(specialties)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
