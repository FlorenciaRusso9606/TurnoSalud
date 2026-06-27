'use client'

import { useState } from 'react'
import { Clock, CalendarDays, Trash2, Pencil, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/Button'
import { CalendarPicker } from '@/components/ui/CalendarPicker'
import { AvailabilityForm } from '@/components/admin/AvailabilityForm'
import { DoctorDetail, DoctorAvailability } from '@/types'

function isoToLocal(iso: string): string {
  return iso.slice(0, 10)
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

type Mode = 'view' | 'add' | 'edit'

interface Props {
  doctor: DoctorDetail
  availability: DoctorAvailability[]
  loading: boolean
  onRefresh: () => void
}

export function DoctorCard({ doctor, availability, loading, onRefresh }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | undefined>()
  const [mode, setMode] = useState<Mode>('view')
  const [deleting, setDeleting] = useState(false)

  const availMap = new Map(availability.map(av => [isoToLocal(av.date), av]))
  const highlightedDates = Array.from(availMap.keys())
  const selectedAv = selectedDate ? availMap.get(selectedDate) : undefined

  function handleSelectDate(date: string) {
    setSelectedDate(prev => (prev === date ? undefined : date))
    setMode('view')
  }

  function handleSuccess() {
    setMode('view')
    onRefresh()
  }

  async function handleDelete() {
    if (!selectedAv) return
    if (!window.confirm('¿Eliminar la disponibilidad de este día?')) return
    setDeleting(true)
    try {
      await api.availability.delete(selectedAv.id)
      toast.success('Disponibilidad eliminada')
      onRefresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setDeleting(false)
    }
  }

  const addDateHint = selectedDate && !selectedAv ? selectedDate : undefined

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      {/* Doctor header */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2a9d8f] text-white text-sm font-semibold">
          {doctor.name[0]}{doctor.lastname[0]}
        </div>
        <div>
          <p className="font-semibold text-gray-900">Dr. {doctor.name} {doctor.lastname}</p>
          <p className="text-sm text-gray-500">Mat. {doctor.licenseNumber} · {doctor.specialty.name}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 py-4">Cargando disponibilidad...</p>
      ) : (
        <div className="flex gap-0">
          {/* Left: Calendar + Legend */}
          <div className="shrink-0 w-64 pr-8">
            <CalendarPicker
              selected={selectedDate}
              onSelect={handleSelectDate}
              highlightedDates={highlightedDates}
              disablePast
            />
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 shrink-0 rounded bg-[#2a9d8f]/15 border border-[#2a9d8f]/30" />
                <span className="text-xs text-gray-400">Agenda cargada</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 shrink-0 rounded border border-gray-200" />
                <span className="text-xs text-gray-400">Sin disponibilidad</span>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-100 self-stretch mr-8 shrink-0" />

          {/* Right: Day detail panel */}
          <div className="flex-1 min-w-0 flex flex-col" style={{ minHeight: 300 }}>

            {mode !== 'view' ? (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-semibold text-gray-800">
                    {mode === 'add' ? 'Nueva disponibilidad' : 'Editar disponibilidad'}
                  </p>
                  <Button variant="ghost" type="button" onClick={() => setMode('view')} className="text-sm">
                    Cancelar
                  </Button>
                </div>
                <AvailabilityForm
                  licenseNumber={doctor.licenseNumber}
                  onSuccess={handleSuccess}
                  defaultDate={mode === 'add' ? addDateHint : undefined}
                  editId={mode === 'edit' ? selectedAv?.id : undefined}
                  defaultValues={
                    mode === 'edit' && selectedAv
                      ? {
                          date: isoToLocal(selectedAv.date),
                          startTime: selectedAv.startTime,
                          endTime: selectedAv.endTime,
                          intervalMinutes: String(selectedAv.intervalMinutes),
                        }
                      : undefined
                  }
                />
              </div>

            ) : !selectedDate ? (
              <div className="flex flex-col flex-1">
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
                  <CalendarDays size={36} className="text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">
                    Seleccioná un día del calendario<br />para ver o gestionar la agenda
                  </p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setMode('add')}
                    className="w-full py-2.5 text-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} /> Agregar disponibilidad
                  </Button>
                </div>
              </div>

            ) : selectedAv ? (
              <div className="flex flex-col flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  {formatDateLabel(selectedDate)}
                </p>
                <div className="rounded-xl bg-[#2a9d8f]/10 border border-[#2a9d8f]/20 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-[#2a9d8f] shrink-0" />
                    <span className="text-sm font-semibold text-gray-800">
                      {selectedAv.startTime} – {selectedAv.endTime}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 pl-[23px]">
                    Turno cada {selectedAv.intervalMinutes} minutos
                  </p>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setMode('edit')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm"
                  >
                    <Pencil size={13} /> Editar
                  </Button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 size={13} /> {deleting ? 'Eliminando...' : 'Eliminar'}
                  </button>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Button
                    variant="outline"
                    onClick={() => setMode('add')}
                    className="w-full py-2.5 text-sm flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} /> Agregar para otro día
                  </Button>
                </div>
              </div>

            ) : (
              <div className="flex flex-col flex-1">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                  {formatDateLabel(selectedDate)}
                </p>
                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 mb-3">
                    <CalendarDays size={22} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Sin disponibilidad</p>
                  <p className="text-xs text-gray-400 mb-5">Este día no tiene agenda cargada</p>
                  <Button
                    onClick={() => setMode('add')}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm"
                  >
                    <Plus size={14} /> Cargar disponibilidad
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
