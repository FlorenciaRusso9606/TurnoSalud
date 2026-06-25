import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../../../prisma'

export const getAvailabilityByDoctor = async (req: Request, res: Response) => {
  const licenseNumber = parseInt(String(req.query.licenseNumber))
  if (isNaN(licenseNumber)) {
    res.status(422).json({ error: 'licenseNumber inválido' })
    return
  }

  try {
    const records = await prisma.doctorAvailability.findMany({
      where: {
        licenseNumber,
        date: { gte: new Date(new Date().toISOString().split('T')[0]) },
      },
      orderBy: { date: 'asc' },
    })
    res.json(records)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

const createSchema = z.object({
  licenseNumber: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inicio inválida'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora fin inválida'),
  intervalMinutes: z.number().int().positive().optional(),
})

export const createAvailability = async (req: Request, res: Response) => {
  const parsed = createSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0].message })
    return
  }

  const { licenseNumber, date, startTime, endTime, intervalMinutes } = parsed.data

  if (startTime >= endTime) {
    res.status(422).json({ error: 'La hora de inicio debe ser anterior a la de fin' })
    return
  }

  try {
    const availability = await prisma.doctorAvailability.create({
      data: {
        licenseNumber,
        date: new Date(date),
        startTime,
        endTime,
        intervalMinutes: intervalMinutes ?? 30,
      },
    })
    res.status(201).json(availability)
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Ya existe disponibilidad para ese médico en esa fecha' })
      return
    }
    if (err.code === 'P2003') {
      res.status(404).json({ error: 'Médico no encontrado' })
      return
    }
    res.status(500).json({ error: err.message })
  }
}

const updateSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora inicio inválida'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Hora fin inválida'),
  intervalMinutes: z.coerce.number().int().positive().optional(),
})

export const updateAvailability = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) {
    res.status(422).json({ error: 'ID inválido' })
    return
  }

  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0].message })
    return
  }

  if (parsed.data.startTime >= parsed.data.endTime) {
    res.status(422).json({ error: 'La hora de inicio debe ser anterior a la de fin' })
    return
  }

  try {
    const availability = await prisma.doctorAvailability.update({
      where: { id },
      data: parsed.data,
    })
    res.json(availability)
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Disponibilidad no encontrada' })
      return
    }
    res.status(500).json({ error: err.message })
  }
}

export const deleteAvailability = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) {
    res.status(422).json({ error: 'ID inválido' })
    return
  }

  try {
    await prisma.doctorAvailability.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Disponibilidad no encontrada' })
      return
    }
    res.status(500).json({ error: err.message })
  }
}
