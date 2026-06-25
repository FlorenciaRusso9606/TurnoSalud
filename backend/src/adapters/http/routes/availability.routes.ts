import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import {
  createAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability,
} from '../controllers/availability.controller'

const router = Router()

router.get('/', authenticate, authorize('ADMIN'), getAvailabilityByDoctor)
router.post('/', authenticate, authorize('ADMIN'), createAvailability)
router.put('/:id', authenticate, authorize('ADMIN'), updateAvailability)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteAvailability)

export default router
