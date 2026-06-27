import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { getAllUsers, updateUser } from '../controllers/user.controller'

const router = Router()

router.get('/',    authenticate, authorize('ADMIN'), getAllUsers)
router.patch('/:id', authenticate, authorize('ADMIN'), updateUser)

export default router
