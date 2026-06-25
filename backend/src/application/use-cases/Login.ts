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
  name: string
  lastname: string
}

export class LoginUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByDni(input.dni)
    if (!user) throw new Error('No existe una cuenta con ese DNI')

    const passwordMatch = await bcrypt.compare(input.password, user.password)
    if (!passwordMatch) throw new Error('La contraseña es incorrecta')

    const secret = process.env.JWT_SECRET
    if (!secret) throw new Error('JWT_SECRET no configurado')

    const token = jwt.sign(
      { userId: user.id, dni: user.dni, licenseNumber: user.licenseNumber ?? null, name: user.name, lastname: user.lastname, role: user.role },
      secret,
      { expiresIn: '8h' }
    )

    return { token, role: user.role, dni: user.dni, name: user.name, lastname: user.lastname }
  }
}
