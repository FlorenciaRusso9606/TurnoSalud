export interface Study {
  id: number
  patientDni: number
  title: string
  description: string | null
  fileUrl: string | null
  date: Date
  createdBy: number
  createdAt: Date
}
