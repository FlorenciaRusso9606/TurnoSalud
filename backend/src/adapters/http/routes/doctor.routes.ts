import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import {
  getDoctorsBySpecialty, getAllDoctors, getDoctorByLicense,
  searchDoctors, createDoctor, updateDoctor,
} from '../controllers/doctor.controller'

const router = Router()

router.get('/search',           searchDoctors)
router.get('/all',              authenticate, authorize('ADMIN'), getAllDoctors)
router.get('/',                 getDoctorsBySpecialty)
router.get('/:licenseNumber',   getDoctorByLicense)
router.post('/',                authenticate, authorize('ADMIN'), createDoctor)
router.patch('/:licenseNumber', authenticate, authorize('ADMIN'), updateDoctor)

export default router
