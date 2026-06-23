import { IStudyRepository } from '../../domain/repositories/IStudyRepository'
import { Study } from '../../domain/entities/Study'
import prisma from '../../prisma'

export class PrismaStudyRepository implements IStudyRepository {
  async findByPatient(patientDni: number): Promise<Study[]> {
    return prisma.study.findMany({
      where: { patientDni },
      orderBy: { date: 'desc' },
    })
  }

  async create(data: {
    patientDni: number
    title: string
    description?: string
    fileUrl?: string
    date: Date
    createdBy: number
  }): Promise<Study> {
    return prisma.study.create({ data })
  }
}
