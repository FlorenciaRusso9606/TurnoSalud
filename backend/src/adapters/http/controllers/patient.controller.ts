import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../../../prisma'
import { createPatientSchema, updatePatientSchema } from '../schemas/patient.schemas'

export const getAllPatients = async (_req: Request, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({
      select: {
        dni: true, birthDate: true, socialWork: true,
        user: { select: { name: true, lastname: true, email: true, phone: true, address: true } },
      },
      orderBy: { user: { lastname: 'asc' } },
    })
    res.json(patients.map(p => ({
      dni: p.dni, name: p.user.name, lastname: p.user.lastname,
      birthDate: p.birthDate, socialWork: p.socialWork,
      email: p.user.email, phone: p.user.phone, address: p.user.address,
    })))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getPatientRecord = async (req: Request, res: Response) => {
  const dni = parseInt(req.params.dni)
  if (isNaN(dni)) { res.status(400).json({ error: 'DNI inválido' }); return }

  try {
    const record = await prisma.patient.findUnique({
      where: { dni },
      include: {
        user: { select: { name: true, lastname: true, email: true, phone: true, address: true } },
        studies: {
          orderBy: { performedAt: 'desc' },
          select: {
            id: true, title: true, institution: true, performedAt: true, fileUrl: true,
            studyType: { select: { name: true } },
          },
        },
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          select: {
            id: true, scheduledAt: true, status: true,
            specialty: { select: { name: true } },
          },
        },
        notes: {
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: { select: { licenseNumber: true, user: { select: { name: true, lastname: true } } } },
          },
        },
      },
    })

    if (!record) { res.status(404).json({ error: 'Paciente no encontrado' }); return }

    const now = new Date()
    const nextAppointment = [...record.appointments]
      .filter(a => new Date(a.scheduledAt) >= now && (a.status === 'PENDING' || a.status === 'CONFIRMED'))
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0] ?? null

    const history = record.appointments.filter(
      a => new Date(a.scheduledAt) < now || a.status === 'CANCELLED' || a.status === 'ABSENT'
    )

    res.json({
      patient: {
        dni: record.dni, name: record.user.name, lastname: record.user.lastname,
        birthDate: record.birthDate, socialWork: record.socialWork,
        email: record.user.email, phone: record.user.phone, address: record.user.address,
      },
      notes: record.notes.map(n => ({
        id: n.id, content: n.content, createdAt: n.createdAt,
        doctorLicense: n.doctorLicense,
        doctorName: n.doctor.user.name,
        doctorLastname: n.doctor.user.lastname,
      })),
      summary: {
        totalStudies: record.studies.length,
        totalAppointments: record.appointments.length,
        totalNotes: record.notes.length,
        lastStudy: record.studies[0]
          ? { id: record.studies[0].id, title: record.studies[0].title, performedAt: record.studies[0].performedAt }
          : null,
        nextAppointment: nextAppointment
          ? { id: nextAppointment.id, scheduledAt: nextAppointment.scheduledAt, status: nextAppointment.status, specialtyName: (nextAppointment as any).specialty?.name ?? null }
          : null,
      },
      studies: record.studies.map(s => ({
        id: s.id, title: s.title, institution: s.institution,
        performedAt: s.performedAt, fileUrl: s.fileUrl,
        studyTypeName: (s as any).studyType?.name ?? null,
      })),
      nextAppointment: nextAppointment ? {
        id: nextAppointment.id, scheduledAt: nextAppointment.scheduledAt,
        specialtyName: (nextAppointment as any).specialty?.name ?? null, status: nextAppointment.status,
      } : null,
      history: history.map(a => ({
        id: a.id, scheduledAt: a.scheduledAt, status: a.status,
        specialtyName: (a as any).specialty?.name ?? null,
      })),
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getPatientByDni = async (req: Request, res: Response) => {
  const dni = parseInt(req.params.dni)
  if (isNaN(dni)) { res.status(400).json({ error: 'DNI inválido' }); return }

  try {
    const p = await prisma.patient.findUnique({
      where: { dni },
      select: {
        dni: true, birthDate: true, socialWork: true,
        user: { select: { name: true, lastname: true, email: true, phone: true, address: true } },
      },
    })
    if (!p) { res.status(404).json({ error: 'Paciente no encontrado' }); return }
    res.json({
      dni: p.dni, name: p.user.name, lastname: p.user.lastname,
      birthDate: p.birthDate, socialWork: p.socialWork,
      email: p.user.email, phone: p.user.phone, address: p.user.address,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const searchPatients = async (req: Request, res: Response) => {
  const q = String(req.query.q ?? '').trim()
  if (!q) { res.status(422).json({ error: 'Parámetro q requerido' }); return }

  try {
    const isNumeric = /^\d+$/.test(q)
    const patients = await prisma.patient.findMany({
      where: isNumeric
        ? { dni: { equals: parseInt(q) } }
        : { user: { OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { lastname: { contains: q, mode: 'insensitive' } },
          ] } },
      select: {
        dni: true, birthDate: true, socialWork: true,
        user: { select: { name: true, lastname: true, email: true, phone: true, address: true } },
      },
      orderBy: { user: { lastname: 'asc' } },
      take: 20,
    })
    res.json(patients.map(p => ({
      dni: p.dni, name: p.user.name, lastname: p.user.lastname,
      birthDate: p.birthDate, socialWork: p.socialWork,
      email: p.user.email, phone: p.user.phone, address: p.user.address,
    })))
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const createPatient = async (req: Request, res: Response) => {
  const parsed = createPatientSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
    return
  }

  const { dni, name, lastname, birthDate, password, socialWork, email, phone, address } = parsed.data

  try {
    const existing = await prisma.user.findUnique({ where: { dni } })
    if (existing) { res.status(409).json({ error: 'El DNI ya está registrado' }); return }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.$transaction(async (tx) => {
      await tx.user.create({
        data: { dni, name, lastname, password: hashedPassword, role: 'PATIENT', email, phone, address },
      })
      await tx.patient.create({
        data: { dni, birthDate: new Date(birthDate), socialWork },
      })
    })

    res.status(201).json({ dni, name, lastname })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const updatePatient = async (req: Request, res: Response) => {
  const dni = parseInt(req.params.dni)
  if (isNaN(dni)) { res.status(422).json({ error: 'DNI inválido' }); return }

  const parsed = updatePatientSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' })
    return
  }

  const { socialWork, email, phone, address } = parsed.data

  try {
    await prisma.$transaction(async (tx) => {
      if (socialWork !== undefined) {
        await tx.patient.update({ where: { dni }, data: { socialWork } })
      }
      await tx.user.update({ where: { dni }, data: { email, phone, address } })
    })
    res.json({ ok: true })
  } catch (err: any) {
    if (err.code === 'P2025') res.status(404).json({ error: 'Paciente no encontrado' })
    else res.status(500).json({ error: err.message })
  }
}
