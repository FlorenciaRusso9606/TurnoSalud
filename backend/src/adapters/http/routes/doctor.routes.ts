import { Router } from 'express'
import { getDoctorsBySpecialty, getDoctorByLicense, searchDoctors } from '../controllers/doctor.controller'

const router = Router()

router.get('/search', searchDoctors)
router.get('/', getDoctorsBySpecialty)
router.get('/:licenseNumber', getDoctorByLicense)

export default router
