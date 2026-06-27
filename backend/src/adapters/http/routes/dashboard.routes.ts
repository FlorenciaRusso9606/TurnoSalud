import { Router } from 'express'
import { authenticate, authorize } from '../middlewares/auth.middleware'
import { getDashboardStats } from '../controllers/dashboard.controller'

const router = Router()

router.get('/', authenticate, authorize('ADMIN'), getDashboardStats)

export default router
