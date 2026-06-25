import { Request, Response } from 'express'
import prisma from '../../../prisma'

export const getAllStudyTypes = async (_req: Request, res: Response) => {
  try {
    const types = await prisma.studyType.findMany({
      orderBy: { name: 'asc' },
    })
    res.json(types)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
