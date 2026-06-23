import { IStudyRepository } from '../../domain/repositories/IStudyRepository'
import { Study } from '../../domain/entities/Study'

interface Input {
  patientDni: number
}

export class GetPatientStudiesUseCase {
  constructor(private studyRepository: IStudyRepository) {}

  async execute(input: Input): Promise<Study[]> {
    return this.studyRepository.findByPatient(input.patientDni)
  }
}
