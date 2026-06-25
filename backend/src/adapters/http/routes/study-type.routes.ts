import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { getAllStudyTypes } from '../controllers/study-type.controller'

const router = Router()

router.get('/', authenticate, authorize('DOCTOR', 'ADMIN'), getAllStudyTypes)

export default router
