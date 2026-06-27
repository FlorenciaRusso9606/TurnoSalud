import { Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import prisma from '../../../prisma'
import { createDoctorSchema, updateDoctorSchema } from '../schemas/doctor.schemas'

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

export const getAllDoctors = async (_req: Request, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({
      select: {
        licenseNumber: true,
        specialtyId: true,
        user: { select: { id: true, name: true, lastname: true, isActive: true, email: true, phone: true } },
        specialty: { select: { name: true } },
      },
      orderBy: { user: { lastname: 'asc' } },
    })
    res.json(
      doctors.map((d) => ({
        licenseNumber: d.licenseNumber,
        specialtyId: d.specialtyId,
        specialtyName: d.specialty.name,
        name: d.user.name,
        lastname: d.user.lastname,
        isActive: d.user.isActive,
        email: d.user.email,
        phone: d.user.phone,
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
    if (!doctor) { res.status(404).json({ error: 'Médico no encontrado' }); return }
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

export const createDoctor = async (req: Request, res: Response) => {
  const parsed = createDoctorSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
    return
  }

  const { dni, name, lastname, licenseNumber, specialtyId, password } = parsed.data

  try {
    const existingUser = await prisma.user.findUnique({ where: { dni } })
    if (existingUser) { res.status(409).json({ error: 'El DNI ya está registrado' }); return }

    const existingDoctor = await prisma.doctor.findUnique({ where: { licenseNumber } })
    if (existingDoctor) { res.status(409).json({ error: 'La matrícula ya está registrada' }); return }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { dni, name, lastname, password: hashedPassword, role: 'DOCTOR' },
      })
      await tx.doctor.create({
        data: { licenseNumber, userId: user.id, specialtyId },
      })
    })

    res.status(201).json({ licenseNumber, name, lastname })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updateDoctor = async (req: Request, res: Response) => {
  const licenseNumber = parseInt(req.params.licenseNumber)
  if (isNaN(licenseNumber)) { res.status(422).json({ error: 'Matrícula inválida' }); return }

  const parsed = updateDoctorSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
    return
  }

  try {
    await prisma.doctor.update({ where: { licenseNumber }, data: parsed.data })
    res.json({ ok: true })
  } catch (err: any) {
    if (err.code === 'P2025') res.status(404).json({ error: 'Médico no encontrado' })
    else res.status(500).json({ error: err.message })
  }
}
