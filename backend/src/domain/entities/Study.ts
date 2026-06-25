export interface Study {
  id: string
  patientDni: number
  studyTypeId: number
  title: string
  description: string | null
  institution: string
  fileUrl: string
  performedAt: Date
  responsibleDoctorLicense: number
  createdBy: number
  createdAt: Date
}
