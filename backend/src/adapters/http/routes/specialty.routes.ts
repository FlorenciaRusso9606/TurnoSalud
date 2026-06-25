import { Router } from 'express'
import { getAllSpecialties } from '../controllers/specialty.controller'

const router = Router()

router.get('/', getAllSpecialties)

export default router
