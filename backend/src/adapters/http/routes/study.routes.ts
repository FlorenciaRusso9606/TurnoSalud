import { Router } from 'express'
import { getMyStudies, getPatientStudies, uploadStudy } from '../controllers/study.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { uploadMiddleware } from '../../../lib/upload'

const router = Router()

router.get('/mine', authenticate, authorize('PATIENT'), getMyStudies)

router.get('/patient/:dni', authenticate, authorize('DOCTOR', 'ADMIN'), getPatientStudies)

router.post(
  '/',
  authenticate,
  authorize('DOCTOR', 'ADMIN'),
  uploadMiddleware.single('file'),
  uploadStudy
)

export default router
