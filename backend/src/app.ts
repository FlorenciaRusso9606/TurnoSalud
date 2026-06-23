import express from 'express'
import cors from 'cors'
import authRoutes from './adapters/http/routes/auth.routes'
import studyRoutes from './adapters/http/routes/study.routes'
import appointmentRoutes from './adapters/http/routes/appointment.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use('/auth', authRoutes)
app.use('/studies', studyRoutes)
app.use('/appointments', appointmentRoutes)

export default app
