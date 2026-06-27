import express from 'express'
import cors from 'cors'
import authRoutes from './adapters/http/routes/auth.routes'
import studyRoutes from './adapters/http/routes/study.routes'
import studyTypeRoutes from './adapters/http/routes/study-type.routes'
import appointmentRoutes from './adapters/http/routes/appointment.routes'
import specialtyRoutes from './adapters/http/routes/specialty.routes'
import doctorRoutes from './adapters/http/routes/doctor.routes'
import availabilityRoutes from './adapters/http/routes/availability.routes'
import patientRoutes from './adapters/http/routes/patient.routes'
import medicalNoteRoutes from './adapters/http/routes/medical-note.routes'
import userRoutes from './adapters/http/routes/user.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_, res) => res.json({ status: 'ok' }))

app.use('/auth', authRoutes)
app.use('/studies', studyRoutes)
app.use('/study-types', studyTypeRoutes)
app.use('/appointments', appointmentRoutes)
app.use('/specialties', specialtyRoutes)
app.use('/doctors', doctorRoutes)
app.use('/availability', availabilityRoutes)
app.use('/patients', patientRoutes)
app.use('/medical-notes', medicalNoteRoutes)
app.use('/users', userRoutes)

export default app
