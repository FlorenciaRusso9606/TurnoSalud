import { IStudyRepository } from '../../domain/repositories/IStudyRepository'
import { Study } from '../../domain/entities/Study'

interface Input {
  patientDni: number
  studyTypeId: number
  title: string
  description?: string
  institution: string
  fileUrl: string
  performedAt: Date
  responsibleDoctorLicense: number
  uploadedByUserId: number
}

export class UploadStudyUseCase {
  constructor(private studyRepository: IStudyRepository) {}

  async execute(input: Input): Promise<Study> {
    return this.studyRepository.create({
      patientDni: input.patientDni,
      studyTypeId: input.studyTypeId,
      title: input.title,
      ...(input.description ? { description: input.description } : {}),
      institution: input.institution,
      fileUrl: input.fileUrl,
      performedAt: input.performedAt,
      responsibleDoctorLicense: input.responsibleDoctorLicense,
      createdBy: input.uploadedByUserId,
    })
  }
}
