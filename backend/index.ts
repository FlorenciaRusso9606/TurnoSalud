import 'dotenv/config'
import app from './src/app'

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`🏥 TurnoSalud backend corriendo en puerto ${PORT}`)
})