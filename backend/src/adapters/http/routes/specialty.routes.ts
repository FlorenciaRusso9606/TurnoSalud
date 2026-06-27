import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { getAllSpecialties, createSpecialty, updateSpecialty, deleteSpecialty } from '../controllers/specialty.controller'

const router = Router()

router.get('/',       getAllSpecialties)
router.post('/',      authenticate, authorize('ADMIN'), createSpecialty)
router.patch('/:id',  authenticate, authorize('ADMIN'), updateSpecialty)
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSpecialty)

export default router
