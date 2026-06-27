import { Request, Response } from 'express'
import prisma from '../../../prisma'

type Range = 'today' | 'week' | 'month'

function getDateRange(range: Range): { from: Date; to: Date } {
  const now = new Date()

  if (range === 'today') {
    const from = new Date(now); from.setUTCHours(0, 0, 0, 0)
    const to   = new Date(now); to.setUTCHours(23, 59, 59, 999)
    return { from, to }
  }

  if (range === 'week') {
    const day = now.getUTCDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const from = new Date(now)
    from.setUTCDate(now.getUTCDate() + diffToMonday)
    from.setUTCHours(0, 0, 0, 0)
    const to = new Date(from)
    to.setUTCDate(from.getUTCDate() + 6)
    to.setUTCHours(23, 59, 59, 999)
    return { from, to }
  }

  // month
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  const to   = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999))
  return { from, to }
}

interface SpecialtyBucket {
  specialtyId: number
  specialtyName: string
  total: number; confirmed: number; pending: number; cancelled: number; absent: number
}

interface DoctorBucket {
  licenseNumber: number
  doctorName: string
  specialtyName: string
  total: number; confirmed: number; pending: number; cancelled: number; absent: number
  absenteeismRate: number
}

function inc(bucket: { confirmed: number; pending: number; cancelled: number; absent: number }, status: string) {
  if (status === 'CONFIRMED')  bucket.confirmed++
  else if (status === 'PENDING')    bucket.pending++
  else if (status === 'CANCELLED')  bucket.cancelled++
  else if (status === 'ABSENT')     bucket.absent++
}

// GET /dashboard?range=today|week|month
export const getDashboardStats = async (req: Request, res: Response) => {
  const range = (['today', 'week', 'month'].includes(req.query.range as string)
    ? req.query.range as Range
    : 'today')

  const { from, to } = getDateRange(range)

  const rows = await prisma.appointment.findMany({
    where: { scheduledAt: { gte: from, lte: to } },
    include: {
      specialty: { select: { id: true, name: true } },
      doctor: { include: { user: { select: { name: true, lastname: true } } } },
    },
  })

  const total     = rows.length
  const confirmed = rows.filter(r => r.status === 'CONFIRMED').length
  const pending   = rows.filter(r => r.status === 'PENDING').length
  const cancelled = rows.filter(r => r.status === 'CANCELLED').length
  const absent    = rows.filter(r => r.status === 'ABSENT').length
  const closed    = confirmed + absent
  const absenteeismRate = closed > 0 ? Math.round((absent / closed) * 100) : 0

  const spMap = new Map<number, SpecialtyBucket>()
  for (const r of rows) {
    const sp = (r as any).specialty
    if (!sp) continue
    if (!spMap.has(sp.id)) {
      spMap.set(sp.id, { specialtyId: sp.id, specialtyName: sp.name, total: 0, confirmed: 0, pending: 0, cancelled: 0, absent: 0 })
    }
    const b = spMap.get(sp.id)!
    b.total++
    inc(b, r.status)
  }
  const bySpecialty = [...spMap.values()].sort((a, b) => b.total - a.total)

  const drMap = new Map<number, DoctorBucket>()
  for (const r of rows) {
    const doc = (r as any).doctor
    const sp  = (r as any).specialty
    if (!drMap.has(r.doctorLicense)) {
      drMap.set(r.doctorLicense, {
        licenseNumber: r.doctorLicense,
        doctorName:    doc?.user ? `${doc.user.lastname}, ${doc.user.name}` : `Matrícula ${r.doctorLicense}`,
        specialtyName: sp?.name ?? '—',
        total: 0, confirmed: 0, pending: 0, cancelled: 0, absent: 0,
        absenteeismRate: 0,
      })
    }
    const b = drMap.get(r.doctorLicense)!
    b.total++
    inc(b, r.status)
  }
  const byDoctor: DoctorBucket[] = [...drMap.values()]
    .map(d => {
      const closed = d.confirmed + d.absent
      return { ...d, absenteeismRate: closed > 0 ? Math.round((d.absent / closed) * 100) : 0 }
    })
    .sort((a, b) => b.total - a.total)

  res.json({ range, from, to, kpis: { total, confirmed, pending, cancelled, absent, absenteeismRate }, bySpecialty, byDoctor })
}
