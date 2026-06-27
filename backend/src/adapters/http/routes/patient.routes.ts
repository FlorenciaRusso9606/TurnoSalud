import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import {
  getAllPatients, searchPatients, getPatientByDni, getPatientRecord,
  createPatient, updatePatient,
} from '../controllers/patient.controller'

const router = Router()

router.get('/search',      authenticate, authorize('DOCTOR', 'ADMIN'), searchPatients)
router.get('/:dni/record', authenticate, authorize('DOCTOR', 'ADMIN'), getPatientRecord)
router.get('/:dni',        authenticate, authorize('DOCTOR', 'ADMIN'), getPatientByDni)
router.get('/',            authenticate, authorize('DOCTOR', 'ADMIN'), getAllPatients)
router.post('/',           authenticate, authorize('ADMIN'),            createPatient)
router.patch('/:dni',      authenticate, authorize('ADMIN'),            updatePatient)

export default router
