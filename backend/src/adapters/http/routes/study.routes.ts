import { Router } from 'express'
import { getMyStudies, getPatientStudies, uploadStudy } from '../controllers/study.controller'
import { authenticate, authorize } from '../middlewares/auth.middleware'

const router = Router()

// Patient: view own studies
router.get('/mine', authenticate, authorize('PATIENT'), getMyStudies)

// Doctor / Admin: view a specific patient's studies
router.get('/patient/:dni', authenticate, authorize('DOCTOR', 'ADMIN'), getPatientStudies)

// Doctor / Admin: upload a study
router.post('/', authenticate, authorize('DOCTOR', 'ADMIN'), uploadStudy)

export default router
