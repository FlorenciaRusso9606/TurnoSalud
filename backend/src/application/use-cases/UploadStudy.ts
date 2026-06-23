import { IStudyRepository } from '../../domain/repositories/IStudyRepository'
import { Study } from '../../domain/entities/Study'

interface Input {
  patientDni: number
  title: string
  description?: string
  fileUrl?: string
  date: Date
  uploadedByUserId: number
}

export class UploadStudyUseCase {
  constructor(private studyRepository: IStudyRepository) {}

  async execute(input: Input): Promise<Study> {
    return this.studyRepository.create({
      patientDni: input.patientDni,
      title: input.title,
      description: input.description,
      fileUrl: input.fileUrl,
      date: input.date,
      createdBy: input.uploadedByUserId,
    })
  }
}
