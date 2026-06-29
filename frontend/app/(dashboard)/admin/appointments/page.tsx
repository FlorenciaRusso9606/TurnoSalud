'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { DoctorSearch } from '@/components/admin/DoctorSearch'
import { PatientSearch } from '@/components/admin/PatientSearch'
import { Appointment, AppointmentStatus, DoctorDetail, Patient } from '@/types'
import { formatDate } from '@/lib/dateUtils'

type Range = 'today' | 'week' | 'month'
type StatusFilter = 'PENDING' | 'CONFIRMED' | 'all'

const TABS: { label: string; value: Range }[] = [
  { label: 'Hoy',         value: 'today' },
  { label: 'Esta semana', value: 'week'  },
  { label: 'Este mes',    value: 'month' },
]

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Pendientes',  value: 'PENDING'   },
  { label: 'Confirmados', value: 'CONFIRMED' },
  { label: 'Todos',       value: 'all'       },
]

export default function AdminAppointmentsPage() {
  const [range, setRange]               = useState<Range>('today')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('PENDING')
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorDetail | null>(null)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    setLoading(true)
    api.appointments.getAdmin(
      range,
      statusFilter !== 'all' ? statusFilter : undefined,
      selectedDoctor?.licenseNumber,
      selectedPatient?.dni,
    )
      .then(setAppointments)
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [range, statusFilter, selectedDoctor, selectedPatient])

  async function handleChangeStatus(id: number, status: AppointmentStatus) {
    try {
      await api.appointments.changeStatus(id, status)
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const pendingCount = appointments.filter(a => a.status === 'PENDING').length

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Gestión de turnos"
        subtitle="Confirmá, cancelá y hacé seguimiento de los turnos del hospital"
      />

      {/* Range tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-4 max-w-xs">
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

      {/* Status filter */}
      <div className="flex gap-2 mb-5">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              statusFilter === f.value
                ? 'bg-[#1d3557] text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {f.value === 'PENDING' && pendingCount > 0 && statusFilter !== 'PENDING' && (
              <span className="ml-1.5 bg-orange-400 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Doctor + patient filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Médico</p>
          <DoctorSearch
            selected={selectedDoctor}
            onSelect={setSelectedDoctor}
          />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Paciente</p>
          <PatientSearch
            selected={selectedPatient}
            onSelect={setSelectedPatient}
          />
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando turnos...</p>}

      {!loading && appointments.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No hay turnos para este período</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {appointments.map(a => {
          const { day, month, time } = formatDate(a.scheduledAt)
          const patientFull = a.patientLastname && a.patientName
            ? `${a.patientLastname}, ${a.patientName}`
            : `DNI ${a.patientDni}`

          return (
            <div
              key={a.id}
              className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex gap-4"
            >
              {/* Fecha */}
              <div className="w-16 shrink-0 text-center bg-[#e6f5f3] rounded-xl py-3 self-start">
                <p className="text-xl font-bold text-[#2a9d8f] leading-none">{day}</p>
                <p className="text-xs text-[#2a9d8f]/70 uppercase font-medium mt-0.5">{month}</p>
                <p className="text-sm text-[#2a9d8f] font-semibold mt-1">{time}</p>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#1d3557] text-base leading-tight">{patientFull}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      DNI {a.patientDni}
                      {a.doctorName    && <span> · Dr./Dra. {a.doctorName}</span>}
                      {a.specialtyName && <span> · {a.specialtyName}</span>}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                {(a.status === 'PENDING' || a.status === 'CONFIRMED') && (
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                    {a.status === 'PENDING' && (
                      <Button
                        variant="success"
                        onClick={() => handleChangeStatus(a.id, 'CONFIRMED')}
                        className="text-sm px-3 py-1.5"
                      >
                        Confirmar
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      onClick={() => handleChangeStatus(a.id, 'CANCELLED')}
                      className="text-sm px-3 py-1.5 text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
