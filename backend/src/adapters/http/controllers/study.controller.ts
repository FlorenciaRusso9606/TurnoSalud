import { Request, Response } from 'express'
import { uploadSchema, patientDniParamSchema } from '../schemas/study.schemas'
import { GetMyStudiesUseCase } from '../../../application/use-cases/GetMyStudies'
import { GetPatientStudiesUseCase } from '../../../application/use-cases/GetPatientStudies'
import { UploadStudyUseCase } from '../../../application/use-cases/UploadStudy'
import { PrismaStudyRepository } from '../../../infrastructure/repositories/PrismaStudyRepository'

const studyRepository = new PrismaStudyRepository()
const getMyStudiesUseCase = new GetMyStudiesUseCase(studyRepository)
const getPatientStudiesUseCase = new GetPatientStudiesUseCase(studyRepository)
const uploadStudyUseCase = new UploadStudyUseCase(studyRepository)



export const getMyStudies = async (req: Request, res: Response) => {
  try {
    const studies = await getMyStudiesUseCase.execute({ patientDni: req.user!.dni })
    res.json(studies)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const getPatientStudies = async (req: Request, res: Response) => {
  const parsed = patientDniParamSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ error: 'DNI inválido' })
    return
  }

  try {
    const studies = await getPatientStudiesUseCase.execute({ patientDni: parsed.data.dni })
    res.json(studies)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const uploadStudy = async (req: Request, res: Response) => {
  const parsed = uploadSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.flatten() })
    return
  }

  try {
    const study = await uploadStudyUseCase.execute({
      ...parsed.data,
      uploadedByUserId: req.user!.userId,
    })
    res.status(201).json(study)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
