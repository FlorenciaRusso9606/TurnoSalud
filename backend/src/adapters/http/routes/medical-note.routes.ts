import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { createMedicalNote } from '../controllers/medical-note.controller'

const router = Router()

router.post('/', authenticate, authorize('DOCTOR'), createMedicalNote)

export default router
