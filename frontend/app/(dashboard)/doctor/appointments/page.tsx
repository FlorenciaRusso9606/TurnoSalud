'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Appointment, AppointmentStatus } from '@/types'
import { formatDate } from '@/lib/dateUtils'

type Range = 'today' | 'week' | 'month'

const TABS: { label: string; value: Range }[] = [
  { label: 'Hoy',         value: 'today' },
  { label: 'Esta semana', value: 'week'  },
  { label: 'Este mes',    value: 'month' },
]

export default function DoctorAppointmentsPage() {
  const [range, setRange] = useState<Range>('today')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

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
    weekday: 'long', day: 'numeric', month: 'long'
  })

  return (
    <div>
      <PageHeader
        title="Mis Turnos"
        subtitle={today.charAt(0).toUpperCase() + today.slice(1)}
      />

      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6 max-w-xs">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setRange(t.value)}
            className={`flex-1 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
              range === t.value
                ? 'shadow-sm font-medium text-gray-100 bg-[#2a9d8f]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando turnos...</p>}

      {!loading && appointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No hay turnos para este período</p>
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-2xl">
        {appointments.map(a => {
          const { day, month, time } = formatDate(a.scheduledAt)
          return (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center gap-4"
            >
              {/* Fecha */}
              <div className="w-14 shrink-0 text-center">
                <p className="text-lg font-bold text-[#1d3557] leading-none">{day}</p>
                <p className="text-xs text-gray-400 uppercase">{month}</p>
                <p className="text-xs text-[#2a9d8f] font-medium mt-0.5">{time}</p>
              </div>

              {/* Info paciente */}
              <div className="flex-1">
                <p className="font-semibold text-[#1d3557]">DNI {a.patientDni}</p>
                <p className="text-sm text-gray-400">Especialidad #{a.specialtyId}</p>
              </div>

              <StatusBadge status={a.status} />

              {/* Acciones */}
              <div className="flex gap-2">
                {a.status === 'PENDING' && (
                  <button
                    onClick={() => handleChangeStatus(a.id, 'CONFIRMED')}
                    className="text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Confirmar
                  </button>
                )}
                {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                  <button
                    onClick={() => handleChangeStatus(a.id, 'ABSENT')}
                    className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Ausente
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
