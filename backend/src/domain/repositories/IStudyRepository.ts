import { Study } from '../entities/Study'

export interface IStudyRepository {
  findByPatient(patientDni: number): Promise<Study[]>
  create(data: {
    patientDni: number
    studyTypeId: number
    title: string
    description?: string
    institution: string
    fileUrl: string
    performedAt: Date
    responsibleDoctorLicense: number
    createdBy: number
  }): Promise<Study>
}
