import { Request, Response } from 'express'
import { RegisterPatientUseCase } from '../../../application/use-cases/RegisterPatient'
import { LoginUseCase } from '../../../application/use-cases/Login'
import { PrismaUserRepository } from '../../../infrastructure/repositories/PrismaUserRepository'
import { registerSchema, loginSchema } from '../schemas/auth.schemas'

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