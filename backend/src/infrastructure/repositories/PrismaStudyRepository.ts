import { IStudyRepository } from '../../domain/repositories/IStudyRepository'
import { Study } from '../../domain/entities/Study'
import prisma from '../../prisma'

export class PrismaStudyRepository implements IStudyRepository {
  async findById(id: string): Promise<Study | null> {
    return prisma.study.findUnique({ where: { id } })
  }

  async findByPatient(patientDni: number): Promise<Study[]> {
    return prisma.study.findMany({
      where: { patientDni },
      orderBy: { performedAt: 'desc' },
    })
  }

  async create(data: {
    patientDni: number
    studyTypeId: number
    title: string
    description?: string
    institution: string
    fileUrl: string
    performedAt: Date
    responsibleDoctorLicense: number
    createdBy: number
  }): Promise<Study> {
    return prisma.study.create({ data })
  }
}
