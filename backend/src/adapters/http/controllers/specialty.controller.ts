import { Request, Response } from 'express'
import prisma from '../../../prisma'
import { specialtyNameSchema } from '../schemas/specialty.schemas'

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

export const createSpecialty = async (req: Request, res: Response) => {
  const parsed = specialtyNameSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0]?.message ?? 'Nombre requerido' })
    return
  }

  try {
    const specialty = await prisma.specialty.create({ data: { name: parsed.data.name } })
    res.status(201).json(specialty)
  } catch (err: any) {
    if (err.code === 'P2002') res.status(409).json({ error: 'Ya existe una especialidad con ese nombre' })
    else res.status(500).json({ error: err.message })
  }
}

export const updateSpecialty = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) { res.status(422).json({ error: 'ID inválido' }); return }

  const parsed = specialtyNameSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0]?.message ?? 'Nombre requerido' })
    return
  }

  try {
    const specialty = await prisma.specialty.update({ where: { id }, data: { name: parsed.data.name } })
    res.json(specialty)
  } catch (err: any) {
    if (err.code === 'P2025') res.status(404).json({ error: 'Especialidad no encontrada' })
    else if (err.code === 'P2002') res.status(409).json({ error: 'Ya existe una especialidad con ese nombre' })
    else res.status(500).json({ error: err.message })
  }
}

export const deleteSpecialty = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) { res.status(422).json({ error: 'ID inválido' }); return }

  try {
    await prisma.specialty.delete({ where: { id } })
    res.status(204).send()
  } catch (err: any) {
    if (err.code === 'P2025') res.status(404).json({ error: 'Especialidad no encontrada' })
    else if (err.code === 'P2003') res.status(409).json({ error: 'No se puede eliminar: tiene médicos o turnos asignados' })
    else res.status(500).json({ error: err.message })
  }
}
