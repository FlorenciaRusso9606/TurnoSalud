'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/lib/dateUtils'
import { Appointment, AppointmentStatus } from '@/types'

export default function MisTurnosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.appointments.getMine()
      .then(setAppointments)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleCancel(id: number) {
    try {
      await api.appointments.cancel(id)
      setAppointments(prev =>
        prev.map(a => a.id === id ? { ...a, status: 'CANCELLED' as AppointmentStatus } : a)
      )
    } catch (e: any) {
      alert(e.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Mis Turnos"
        subtitle="Tus próximas citas médicas"
        action={
          <Link
            href="/turnos/nuevo"
            className="flex items-center gap-1.5 bg-[#2a9d8f] hover:bg-[#238a7e] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            Sacar turno
          </Link>
        }
      />

      {loading && <p className="text-gray-400 text-sm">Cargando turnos...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && appointments.length === 0 && (
        <EmptyState
          message="No tenés turnos registrados"
          action={
            <Link href="/turnos/nuevo" className="text-[#2a9d8f] font-medium hover:underline text-sm">
              Sacar tu primer turno →
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-3">
        {appointments.map(appointment => {
          const { day, month, time } = formatDate(appointment.scheduledAt)
          const isFuture = new Date(appointment.scheduledAt) > new Date()
          const canCancel = isFuture && (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED')

          return (
            <div
              key={appointment.id}
              className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center gap-4"
            >
              <div className="w-12 text-center bg-[#e6f5f3] rounded-xl py-2 flex-shrink-0">
                <div className="text-lg font-bold text-[#2a9d8f]">{day}</div>
                <div className="text-xs text-[#2a9d8f] font-medium">{month}</div>
              </div>

              <div className="flex-1">
                <p className="font-semibold text-[#1d3557]">
                  {appointment.specialtyName ?? `Especialidad #${appointment.specialtyId}`}
                </p>
                <p className="text-sm text-gray-500">
                  {appointment.doctorName ? `Dr. ${appointment.doctorName}` : `Dr. ${appointment.doctorLicense}`} · {time}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={appointment.status} />
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancel(appointment.id)}
                    className="text-sm border-gray-400 text-gray-500 hover:border-red-300 hover:text-red-500 px-3 py-1"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
