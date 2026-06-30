import { Request, Response } from 'express'
import { RegisterPatientUseCase } from '../../../application/use-cases/RegisterPatient'
import { LoginUseCase } from '../../../application/use-cases/Login'
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository'
import { registerSchema, loginSchema } from '../schemas/auth.schemas'
import prisma from '../../../prisma'

const userRepository = new PrismaUserRepository()
const registerUseCase = new RegisterPatientUseCase(userRepository)
const loginUseCase = new LoginUseCase(userRepository)

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const user = await registerUseCase.execute(parsed.data)
    res.status(201).json(user)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const result = await loginUseCase.execute(parsed.data)
    res.status(200).json(result)
  } catch (err: any) {
    res.status(401).json({ error: err.message })
  }
}

export const getMe = async (req: Request, res: Response) => {
  const { dni, role } = (req as any).user

  try {
    const user = await prisma.user.findUnique({
      where: { dni },
      select: { name: true, lastname: true, email: true, phone: true, address: true },
    })
    if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return }

    if (role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { dni },
        select: { birthDate: true, socialWork: true },
      })
      res.json({ dni, role, ...user, ...patient })
      return
    }

    if (role === 'DOCTOR') {
      const { userId } = (req as any).user
      const doctor = await prisma.doctor.findUnique({
        where: { userId },
        select: { licenseNumber: true, specialty: { select: { name: true } } },
      })
      res.json({ dni, role, ...user, licenseNumber: doctor?.licenseNumber ?? null, specialtyName: doctor?.specialty?.name ?? null })
      return
    }

    res.json({ dni, role, ...user })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}