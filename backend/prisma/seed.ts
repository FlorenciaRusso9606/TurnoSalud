import { PrismaClient, AppointmentStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await prisma.study.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.doctorAvailability.deleteMany()
  await prisma.doctor.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.specialty.deleteMany()
  await prisma.user.deleteMany()
  await prisma.studyType.deleteMany()

  const hash = (pwd: string) => bcrypt.hash(pwd, 10)

  console.log('  → Tipos de estudio...')
  const [hemograma, bioquimica, orina, radiografia, ecografia, tomografia, resonancia, ecg, otros] =
    await Promise.all([
      prisma.studyType.create({ data: { name: 'Hemograma' } }),
      prisma.studyType.create({ data: { name: 'Bioquímica' } }),
      prisma.studyType.create({ data: { name: 'Orina completa' } }),
      prisma.studyType.create({ data: { name: 'Radiografía' } }),
      prisma.studyType.create({ data: { name: 'Ecografía' } }),
      prisma.studyType.create({ data: { name: 'Tomografía' } }),
      prisma.studyType.create({ data: { name: 'Resonancia magnética' } }),
      prisma.studyType.create({ data: { name: 'Electrocardiograma' } }),
      prisma.studyType.create({ data: { name: 'Otros' } }),
    ])

  console.log('  → Especialidades...')
  const [clinica, cardiologia, pediatria, traumatologia, ginecologia, oftalmologia] =
    await Promise.all([
      prisma.specialty.create({ data: { name: 'Clínica Médica' } }),
      prisma.specialty.create({ data: { name: 'Cardiología' } }),
      prisma.specialty.create({ data: { name: 'Pediatría' } }),
      prisma.specialty.create({ data: { name: 'Traumatología' } }),
      prisma.specialty.create({ data: { name: 'Ginecología' } }),
      prisma.specialty.create({ data: { name: 'Oftalmología' } }),
    ])

  console.log('  → Admin...')
  await prisma.user.create({
    data: {
      dni: 11111111,
      lastname: 'Florencia',
      name: 'Russo',
      password: await hash('admin123'),
      role: 'ADMIN',
    }
  })

  console.log('  → Médicos...')
  const doctorsData = [
    { dni: 22222201, license: 10001, name: 'Ana',      lastname: 'García',     specialtyId: clinica.id },
    { dni: 22222202, license: 10002, name: 'Carlos',   lastname: 'Martínez',   specialtyId: clinica.id },
    { dni: 22222203, license: 10003, name: 'Marina',   lastname: 'Sosa',       specialtyId: cardiologia.id },
    { dni: 22222204, license: 10004, name: 'Roberto',  lastname: 'Villanueva', specialtyId: cardiologia.id },
    { dni: 22222205, license: 10005, name: 'Luisa',    lastname: 'Fernández',  specialtyId: pediatria.id },
    { dni: 22222206, license: 10006, name: 'Andrés',   lastname: 'Vidal',      specialtyId: traumatologia.id },
    { dni: 22222207, license: 10007, name: 'Carla',    lastname: 'Ñancucheo',  specialtyId: ginecologia.id },
    { dni: 22222208, license: 10008, name: 'Marcelo',  lastname: 'Torres',     specialtyId: oftalmologia.id },
  ]

  for (const d of doctorsData) {
    const user = await prisma.user.create({
      data: {
        dni: d.dni,
        name: d.name,
        lastname: d.lastname,
        password: await hash('medico123'),
        role: 'DOCTOR',
      }
    })
    await prisma.doctor.create({
      data: {
        licenseNumber: d.license,
        userId: user.id,
        specialtyId: d.specialtyId,
      }
    })
  }

  console.log('  → Pacientes...')
  const patientsData = [
    { dni: 33333301, name: 'Juan',      lastname: 'Pérez',     birthDate: new Date('1990-03-15'), socialWork: 'OSDE' },
    { dni: 33333302, name: 'María',     lastname: 'González',  birthDate: new Date('1985-07-22'), socialWork: 'PAMI' },
    { dni: 33333303, name: 'Pedro',     lastname: 'Rodríguez', birthDate: new Date('1978-11-08'), socialWork: 'IOMA' },
    { dni: 33333304, name: 'Laura',     lastname: 'López',     birthDate: new Date('1995-01-30'), socialWork: null },
    { dni: 33333305, name: 'Diego',     lastname: 'Herrera',   birthDate: new Date('1982-09-14'), socialWork: 'Swiss Medical' },
    { dni: 33333306, name: 'Valentina', lastname: 'Castro',    birthDate: new Date('2000-05-03'), socialWork: 'OSDE' },
  ]

  for (const p of patientsData) {
    await prisma.user.create({
      data: {
        dni: p.dni,
         name: p.name,
        lastname: p.lastname,
        password: await hash('paciente123'),
        role: 'PATIENT',
      }
    })
    await prisma.patient.create({
      data: {
        dni: p.dni,
        birthDate: p.birthDate,
        socialWork: p.socialWork ?? undefined,
      }
    })
  }

  console.log('  → Disponibilidad...')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let offsetDias = 0; offsetDias <= 7; offsetDias++) {
    const fecha = new Date(today)
    fecha.setDate(fecha.getDate() + offsetDias)
    for (const d of doctorsData) {
      await prisma.doctorAvailability.create({
        data: {
          licenseNumber: d.license,
          date: fecha,
          startTime: '08:00',
          endTime: '12:00',
          intervalMinutes: 30,
        }
      }).catch(() => {})
    }
  }

  console.log('  → Turnos...')
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const turnosData: {
    scheduledAt: Date
    patientDni: number
    doctorLicense: number
    specialtyId: number
    status: AppointmentStatus
  }[] = [
    { scheduledAt: slot(yesterday, 8, 0),  patientDni: 33333301, doctorLicense: 10003, specialtyId: cardiologia.id,    status: 'CONFIRMED' },
    { scheduledAt: slot(yesterday, 8, 30), patientDni: 33333302, doctorLicense: 10001, specialtyId: clinica.id,        status: 'ABSENT' },
    { scheduledAt: slot(yesterday, 9, 0),  patientDni: 33333303, doctorLicense: 10005, specialtyId: pediatria.id,      status: 'CONFIRMED' },
    { scheduledAt: slot(yesterday, 9, 30), patientDni: 33333304, doctorLicense: 10006, specialtyId: traumatologia.id,  status: 'CANCELLED' },
    { scheduledAt: slot(today, 8, 0),      patientDni: 33333301, doctorLicense: 10001, specialtyId: clinica.id,        status: 'CONFIRMED' },
    { scheduledAt: slot(today, 8, 30),     patientDni: 33333302, doctorLicense: 10003, specialtyId: cardiologia.id,    status: 'PENDING' },
    { scheduledAt: slot(today, 9, 0),      patientDni: 33333303, doctorLicense: 10005, specialtyId: pediatria.id,      status: 'PENDING' },
    { scheduledAt: slot(today, 9, 30),     patientDni: 33333305, doctorLicense: 10006, specialtyId: traumatologia.id,  status: 'CONFIRMED' },
    { scheduledAt: slot(today, 10, 0),     patientDni: 33333306, doctorLicense: 10007, specialtyId: ginecologia.id,    status: 'PENDING' },
    { scheduledAt: slot(today, 10, 30),    patientDni: 33333304, doctorLicense: 10008, specialtyId: oftalmologia.id,   status: 'PENDING' },
    { scheduledAt: slot(today, 11, 0),     patientDni: 33333301, doctorLicense: 10002, specialtyId: clinica.id,        status: 'PENDING' },
    { scheduledAt: slot(futuro(1), 8, 0),  patientDni: 33333301, doctorLicense: 10003, specialtyId: cardiologia.id,    status: 'CONFIRMED' },
    { scheduledAt: slot(futuro(1), 8, 30), patientDni: 33333302, doctorLicense: 10006, specialtyId: traumatologia.id,  status: 'PENDING' },
    { scheduledAt: slot(futuro(2), 9, 0),  patientDni: 33333303, doctorLicense: 10001, specialtyId: clinica.id,        status: 'PENDING' },
    { scheduledAt: slot(futuro(2), 9, 30), patientDni: 33333305, doctorLicense: 10007, specialtyId: ginecologia.id,    status: 'PENDING' },
    { scheduledAt: slot(futuro(3), 8, 0),  patientDni: 33333306, doctorLicense: 10005, specialtyId: pediatria.id,      status: 'CONFIRMED' },
    { scheduledAt: slot(futuro(4), 10, 0), patientDni: 33333304, doctorLicense: 10008, specialtyId: oftalmologia.id,   status: 'PENDING' },
  ]

  for (const t of turnosData) {
    await prisma.appointment.create({ data: t }).catch(() => {})
  }

  console.log('  → Estudios...')
  const adminUser = await prisma.user.findUnique({ where: { dni: 11111111 } })

  const PDF_SAMPLE = 'https://www.w3.org/WAI/WCAG21/working-examples/pdf-table/table.pdf'

  const estudiosData = [
    { patientDni: 33333301, studyTypeId: hemograma.id,   title: 'Hemograma completo',    description: 'Valores dentro de parámetros normales.',        institution: 'Laboratorio Central',       performedAt: hace(30), responsibleDoctorLicense: 10001, fileUrl: PDF_SAMPLE },
    { patientDni: 33333301, studyTypeId: ecg.id,         title: 'Electrocardiograma',    description: 'Sin alteraciones significativas.',               institution: 'Clínica del Sol',           performedAt: hace(15), responsibleDoctorLicense: 10003, fileUrl: PDF_SAMPLE },
    { patientDni: 33333301, studyTypeId: radiografia.id, title: 'Radiografía de tórax',  description: 'Sin infiltrados pulmonares.',                    institution: 'Centro de Diagnóstico',     performedAt: hace(7),  responsibleDoctorLicense: 10001, fileUrl: PDF_SAMPLE },
    { patientDni: 33333302, studyTypeId: bioquimica.id,  title: 'Análisis de sangre',    description: 'Colesterol levemente elevado. Se indica dieta.', institution: 'Laboratorio Central',       performedAt: hace(20), responsibleDoctorLicense: 10001, fileUrl: PDF_SAMPLE },
    { patientDni: 33333302, studyTypeId: ecografia.id,   title: 'Ecografía abdominal',   description: 'Sin hallazgos patológicos.',                     institution: 'Centro de Diagnóstico',     performedAt: hace(10), responsibleDoctorLicense: 10001, fileUrl: PDF_SAMPLE },
    { patientDni: 33333303, studyTypeId: radiografia.id, title: 'Radiografía de rodilla',description: 'Desgaste leve en menisco medial.',               institution: 'Centro de Diagnóstico',     performedAt: hace(5),  responsibleDoctorLicense: 10006, fileUrl: PDF_SAMPLE },
    { patientDni: 33333304, studyTypeId: hemograma.id,   title: 'Hemograma',             description: 'Anemia leve. Se indica hierro.',                 institution: 'Laboratorio San Martín',    performedAt: hace(14), responsibleDoctorLicense: 10005, fileUrl: PDF_SAMPLE },
    { patientDni: 33333305, studyTypeId: ecg.id,         title: 'Ecocardiograma',        description: 'Función ventricular conservada.',                institution: 'Clínica del Sol',           performedAt: hace(3),  responsibleDoctorLicense: 10003, fileUrl: PDF_SAMPLE },
    { patientDni: 33333306, studyTypeId: otros.id,       title: 'Papanicolau',           description: 'Sin alteraciones. Control anual.',               institution: 'Hospital Provincial',       performedAt: hace(60), responsibleDoctorLicense: 10007, fileUrl: PDF_SAMPLE },
  ]

  for (const e of estudiosData) {
    await prisma.study.create({
      data: { ...e, createdBy: adminUser!.id }
    })
  }

  console.log('')
  console.log('✅ Seed completado!')
  console.log('─────────────────────────────────────────')
  console.log('CREDENCIALES DE PRUEBA')
  console.log('─────────────────────────────────────────')
  console.log('ADMIN     │ DNI: 11111111  │ pass: admin123')
  console.log('MÉDICOS   │ DNI: 2222220X  │ pass: medico123  (X = 1 al 8)')
  console.log('PACIENTES │ DNI: 3333330X  │ pass: paciente123  (X = 1 al 6)')
  console.log('─────────────────────────────────────────')
}

function slot(base: Date, horas: number, minutos: number): Date {
  const d = new Date(base)
  d.setHours(horas, minutos, 0, 0)
  return d
}

function futuro(dias: number): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + dias)
  return d
}

function hace(dias: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - dias)
  return d
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())