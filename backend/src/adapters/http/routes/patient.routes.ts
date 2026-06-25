import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { getAllPatients, searchPatients } from '../controllers/patient.controller'

const router = Router()

router.get('/search', authenticate, authorize('DOCTOR', 'ADMIN'), searchPatients)
router.get('/', authenticate, authorize('DOCTOR', 'ADMIN'), getAllPatients)

export default router
