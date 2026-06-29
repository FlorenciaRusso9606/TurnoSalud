'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { api } from '@/lib/api'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Appointment, AppointmentStatus } from '@/types'
import { formatDate } from '@/lib/dateUtils'

type Range = 'today' | 'week' | 'month'

const TABS: { label: string; value: Range }[] = [
  { label: 'Hoy',         value: 'today' },
  { label: 'Esta semana', value: 'week'  },
  { label: 'Este mes',    value: 'month' },
]

export default function DoctorAppointmentsPage() {
  const [range, setRange]             = useState<Range>('today')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    setLoading(true)
    api.appointments.getDoctor(range)
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [range])

  async function handleChangeStatus(id: number, status: AppointmentStatus) {
    try {
      await api.appointments.changeStatus(id, status)
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status } : a)
      )
    } catch (e: any) {
      alert(e.message)
    }
  }

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
      />

      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6 max-w-xs">
        {TABS.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setRange(t.value)}
            className={`flex-1 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
              range === t.value
                ? 'shadow-sm font-medium text-white bg-[#2a9d8f]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando agenda...</p>}

      {!loading && appointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center max-w-2xl">
          <p className="text-gray-400">No hay turnos para este período</p>
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-2xl">
        {appointments.map(a => {
          const { day, month, time } = formatDate(a.scheduledAt)
          const fullName = a.patientLastname && a.patientName
            ? `${a.patientLastname}, ${a.patientName}`
            : `DNI ${a.patientDni}`

          return (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex gap-4"
            >
              {/* Bloque de fecha */}
              <div className="w-16 shrink-0 text-center bg-[#e6f5f3] rounded-xl py-3 self-start">
                <p className="text-xl font-bold text-[#2a9d8f] leading-none">{day}</p>
                <p className="text-xs text-[#2a9d8f]/70 uppercase font-medium mt-0.5">{month}</p>
                <p className="text-sm text-[#2a9d8f] font-semibold mt-1">{time}</p>
              </div>

              {/* Contenido principal */}
              <div className="flex-1 min-w-0">
                {/* Fila superior: nombre + badge */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1d3557] text-base leading-tight">{fullName}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      DNI {a.patientDni}
                      {a.patientSocialWork && <span> · {a.patientSocialWork}</span>}
                      {a.specialtyName    && <span> · {a.specialtyName}</span>}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                {/* Fila de acciones */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                  {a.status === 'CONFIRMED' && (
                    <Button
                      variant="danger"
                      onClick={() => handleChangeStatus(a.id, 'ABSENT')}
                      className="text-sm px-3 py-1.5"
                    >
                      Marcar ausente
                    </Button>
                  )}
                  <Link
                    href={`/doctor/patients/${a.patientDni}`}
                    className="ml-auto flex items-center gap-1.5 text-sm border border-gray-200 hover:border-[#2a9d8f] hover:text-[#2a9d8f] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <UserRound size={13} />
                    Ver ficha
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
