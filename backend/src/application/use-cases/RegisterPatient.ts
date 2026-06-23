import bcrypt from 'bcryptjs'
import { IUserRepository } from '../../domain/repositories/IUserRepository'
import prisma from '../../prisma'

interface RegisterInput {
  dni: number
  password: string
  name: string
  lastname: string
  socialWork?: string
}

interface RegisterOutput {
  id: number
  dni: number
  role: string
}

export class RegisterPatientUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existing = await this.userRepository.findByDni(input.dni)
    if (existing) throw new Error('El DNI ya está registrado')

    const hashedPassword = await bcrypt.hash(input.password, 10)

    const user = await this.userRepository.create({
      dni: input.dni,
      password: hashedPassword,
      role: 'PATIENT',
    })

    await prisma.patient.create({
      data: {
        dni: input.dni,
        name: input.name,
        lastname: input.lastname,
        socialWork: input.socialWork,
      },
    })

    return { id: user.id, dni: user.dni, role: user.role }
  }
}
