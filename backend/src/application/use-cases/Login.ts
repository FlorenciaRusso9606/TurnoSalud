import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { IUserRepository } from '../../domain/repositories/IUserRepository'

interface LoginInput {
  dni: number
  password: string
}

interface LoginOutput {
  token: string
  role: string
  dni: number
}

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByDni(input.dni)
    if (!user) throw new Error('Credenciales inválidas')

    const passwordMatch = await bcrypt.compare(input.password, user.password)
    if (!passwordMatch) throw new Error('Credenciales inválidas')

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET no configurado')

    const token = jwt.sign(
      { userId: user.id, dni: user.dni, role: user.role },
      secret,
      { expiresIn: '8h' }
    )

    return { token, role: user.role, dni: user.dni }
  }
}
