import cron from 'node-cron'
import prisma from '../prisma'
import { sendAppointmentReminder } from './email'

export function startReminderJob() {
  // 11:00 UTC = 08:00 ART 
  cron.schedule('0 11 * * *', async () => {
    const from = new Date(Date.now() + 20 * 60 * 60 * 1000)
    const to   = new Date(Date.now() + 32 * 60 * 60 * 1000)

    const appointments = await prisma.appointment.findMany({
      where: { scheduledAt: { gte: from, lte: to }, status: 'CONFIRMED' },
      include: {
        patient:  { include: { user: { select: { email: true, name: true, lastname: true } } } },
        doctor:   { include: { user: { select: { name: true, lastname: true } } } },
        specialty: { select: { name: true } },
      },
    })

    for (const appt of appointments) {
      const email = appt.patient.user.email
      if (!email) continue

      try {
        await sendAppointmentReminder({
          to:          email,
          patientName: `${appt.patient.user.name} ${appt.patient.user.lastname}`,
          doctorName:  `${appt.doctor.user.lastname}, ${appt.doctor.user.name}`,
          specialty:   (appt.specialty as any).name,
          scheduledAt: appt.scheduledAt,
        })
      } catch (err) {
        console.error(`Reminder email failed for appointment ${appt.id}:`, err)
      }
    }

    console.log(`Reminder job: procesados ${appointments.length} turnos`)
  })
}
