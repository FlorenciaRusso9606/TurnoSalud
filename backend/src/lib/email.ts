import { Resend } from 'resend'

const FROM = 'Hospital Cervantes <onboarding@resend.dev>'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function formatDateTime(date: Date) {
  return date.toLocaleString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires',
  })
}

function baseTemplate(content: string) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
            <tr>
              <td style="background:#2a9d8f;padding:24px 32px">
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:rgba(255,255,255,0.2);border-radius:8px;width:36px;height:36px;text-align:center;vertical-align:middle">
                      <span style="color:#fff;font-size:20px;font-weight:bold">+</span>
                    </td>
                    <td style="padding-left:12px">
                      <p style="margin:0;color:#ffffff;font-size:16px;font-weight:700;line-height:1">TurnoSalud</p>
                      <p style="margin:2px 0 0;color:rgba(255,255,255,0.75);font-size:11px">Hospital Cervantes · Río Negro</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="padding:32px">${content}</td></tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #f1f5f9;background:#f8fafc">
                <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6">
                  Hospital Zonal · General Roca · Río Negro<br>
                  Guardia: (0298) 444-0000 · Turnos: (0298) 444-0001
                </p>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `
}

interface EmailParams {
  to: string
  patientName: string
  doctorName: string
  specialty: string
  scheduledAt: Date
}

export async function sendBookingConfirmation(params: EmailParams) {
  const { to, patientName, doctorName, specialty, scheduledAt } = params
  const dateStr = formatDateTime(scheduledAt)

  const content = `
    <p style="margin:0 0 4px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Turno reservado</p>
    <h1 style="margin:0 0 24px;color:#1d3557;font-size:22px;font-weight:700">¡Tu turno fue registrado!</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6">
      Hola <strong>${patientName}</strong>, confirmamos que tu solicitud de turno fue recibida correctamente.
      La recepción del hospital lo confirmará en breve.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf8;border:1px solid #bbf7d0;border-radius:12px;margin:0 0 24px">
      <tr><td style="padding:20px 24px">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;width:120px">Fecha y hora</td>
            <td style="padding:6px 0;color:#1d3557;font-size:13px;font-weight:600">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Médico/a</td>
            <td style="padding:6px 0;color:#1d3557;font-size:13px;font-weight:600">Dr./Dra. ${doctorName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Especialidad</td>
            <td style="padding:6px 0;color:#1d3557;font-size:13px;font-weight:600">${specialty}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">
      Si necesitás cancelar tu turno, ingresá a TurnoSalud con tu DNI.
      Para consultas urgentes llamá al (0298) 444-0001.
    </p>
  `

  await getResend().emails.send({ from: FROM, to, subject: 'Tu turno fue registrado – Hospital Cervantes', html: baseTemplate(content) })
}

export async function sendAppointmentReminder(params: EmailParams) {
  const { to, patientName, doctorName, specialty, scheduledAt } = params
  const dateStr = formatDateTime(scheduledAt)

  const content = `
    <p style="margin:0 0 4px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:.05em">Recordatorio</p>
    <h1 style="margin:0 0 24px;color:#1d3557;font-size:22px;font-weight:700">Tu turno es mañana</h1>
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.6">
      Hola <strong>${patientName}</strong>, te recordamos que tenés un turno programado para mañana.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin:0 0 24px">
      <tr><td style="padding:20px 24px">
        <table cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px;width:120px">Fecha y hora</td>
            <td style="padding:6px 0;color:#1d3557;font-size:13px;font-weight:600">${dateStr}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Médico/a</td>
            <td style="padding:6px 0;color:#1d3557;font-size:13px;font-weight:600">Dr./Dra. ${doctorName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b;font-size:13px">Especialidad</td>
            <td style="padding:6px 0;color:#1d3557;font-size:13px;font-weight:600">${specialty}</td>
          </tr>
        </table>
      </td></tr>
    </table>
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">
      Presentate 10 minutos antes con DNI. Si no podés asistir, cancelá el turno desde TurnoSalud
      o llamando al (0298) 444-0001.
    </p>
  `

  await getResend().emails.send({ from: FROM, to, subject: 'Recordatorio: tu turno es mañana – Hospital Cervantes', html: baseTemplate(content) })
}
