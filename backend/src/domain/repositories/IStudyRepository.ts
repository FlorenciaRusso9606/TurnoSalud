import { Study } from '../entities/Study'

export interface IStudyRepository {
  findByPatient(patientDni: number): Promise<Study[]>
  create(data: {
    patientDni: number
    title: string
    description?: string
    fileUrl?: string
    date: Date
    createdBy: number
  }): Promise<Study>
}
