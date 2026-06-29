import 'dotenv/config'
import app from './app'
import { startReminderJob } from './lib/reminderJob'

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`TurnoSalud backend corriendo en puerto ${PORT}`)
  startReminderJob()
})
