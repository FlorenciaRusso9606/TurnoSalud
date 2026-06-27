import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../../../prisma'
import { updateUserSchema } from '../schemas/user.schemas'

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true, dni: true, name: true, lastname: true,
        role: true, isActive: true, email: true, phone: true, address: true, createdAt: true,
      },
      orderBy: [{ role: 'asc' }, { lastname: 'asc' }],
    })
    res.json(users)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updateUser = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  if (isNaN(id)) { res.status(422).json({ error: 'ID inválido' }); return }

  const parsed = updateUserSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
    return
  }

  const { password, ...rest } = parsed.data
  const data: Record<string, unknown> = { ...rest }

  if (password) {
    data.password = await bcrypt.hash(password, 10)
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true, dni: true, name: true, lastname: true,
        role: true, isActive: true, email: true, phone: true, address: true,
      },
    })
    res.json(user)
  } catch (err: any) {
    if (err.code === 'P2025') res.status(404).json({ error: 'Usuario no encontrado' })
    else res.status(500).json({ error: err.message })
  }
}
