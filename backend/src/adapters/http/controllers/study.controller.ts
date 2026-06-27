import { Request, Response } from 'express'

type UploadRequest = Request & {
  file?: { buffer: Buffer; originalname: string; mimetype: string; size: number }
}
import { uploadSchema, patientDniParamSchema, studyIdParamSchema } from '../schemas/study.schemas'
import { GetPatientStudiesUseCase } from '../../../application/use-cases/GetPatientStudies'
import { UploadStudyUseCase } from '../../../application/use-cases/UploadStudy'
import { PrismaStudyRepository } from '../../../infrastructure/repositories/PrismaStudyRepository'
import { uploadFileToS3, extractS3Key, getPresignedDownloadUrl } from '../../../lib/s3'

const studyRepository = new PrismaStudyRepository()
const getPatientStudiesUseCase = new GetPatientStudiesUseCase(studyRepository)
const uploadStudyUseCase = new UploadStudyUseCase(studyRepository)

export const getMyStudies = async (req: Request, res: Response) => {
  try {
    const studies = await getPatientStudiesUseCase.execute({ patientDni: req.user!.dni })
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

export const getStudyDownloadUrl = async (req: Request, res: Response) => {
  const parsed = studyIdParamSchema.safeParse(req.params)
  if (!parsed.success) {
    res.status(400).json({ error: 'ID de estudio inválido' })
    return
  }

  const study = await studyRepository.findById(parsed.data.studyId)
  if (!study) {
    res.status(404).json({ error: 'Estudio no encontrado' })
    return
  }

  try {
    const key = extractS3Key(study.fileUrl)
    const url = await getPresignedDownloadUrl(key)
    res.json({ url })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export const uploadStudy = async (req: UploadRequest, res: Response) => {
  if (!req.file) {
    res.status(422).json({ error: 'El archivo PDF es requerido' })
    return
  }

  const parsed = uploadSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({ error: parsed.error.issues[0].message })
    return
  }

  // For DOCTOR role, override responsibleDoctorLicense with their own from JWT
  const responsibleDoctorLicense =
    req.user!.role === 'DOCTOR'
      ? req.user!.licenseNumber!
      : parsed.data.responsibleDoctorLicense

  try {
    const fileUrl = await uploadFileToS3(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    )

    const study = await uploadStudyUseCase.execute({
      ...parsed.data,
      responsibleDoctorLicense,
      fileUrl,
      uploadedByUserId: req.user!.userId,
    })
    res.status(201).json(study)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
