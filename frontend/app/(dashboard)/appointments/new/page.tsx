'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Specialty, Doctor, AvailableSlot } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormSelect } from '@/components/ui/FormSelect'
import { CalendarPicker } from '@/components/ui/CalendarPicker'
import { Alert } from '@/components/ui/Alert'
import { formatTime } from '@/lib/dateUtils'

export default function NuevoTurnoPage() {
  const router = useRouter()
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [specialtyId, setSpecialtyId] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [doctorLicense, setDoctorLicense] = useState('')
  const [availabilityDates, setAvailabilityDates] = useState<string[]>([])
  const [fullyBookedDates, setFullyBookedDates] = useState<string[]>([])
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.specialties.getAll().then(setSpecialties).catch(() => {})
  }, [])

  useEffect(() => {
    if (!specialtyId) return
    setDoctors([])
    setDoctorLicense('')
    setDate('')
    setSlots([])
    setSelectedSlot(null)
    api.doctors.getBySpecialty(Number(specialtyId)).then(setDoctors).catch(() => {})
  }, [specialtyId])

  useEffect(() => {
    if (!doctorLicense) return
    setDate('')
    setSlots([])
    setSelectedSlot(null)
    setAvailabilityDates([])
    setFullyBookedDates([])
    api.availability.getByDoctor(Number(doctorLicense))
      .then(av => setAvailabilityDates(av.map(a => a.date.slice(0, 10))))
      .catch(() => {})
  }, [doctorLicense])

  useEffect(() => {
    if (!doctorLicense || !date) return
    setSlots([])
    setSelectedSlot(null)
    setLoadingSlots(true)
    api.appointments.getAvailable(Number(specialtyId), date)
      .then(all => {
        const doctorSlots = all.filter(s => s.doctorLicense === Number(doctorLicense))
        setSlots(doctorSlots)
        const allBooked = doctorSlots.length > 0 && doctorSlots.every(s => s.booked)
        if (allBooked) setFullyBookedDates(prev => [...new Set([...prev, date])])
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [doctorLicense, date])

  async function handleConfirm() {
    if (!selectedSlot) return
    setLoading(true)
    setError('')
    try {
      await api.appointments.book({
        doctorLicense: selectedSlot.doctorLicense,
        specialtyId: Number(specialtyId),
        scheduledAt: selectedSlot.scheduledAt,
      })
      router.push('/appointments')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const step = !specialtyId ? 1 : !doctorLicense ? 2 : !date ? 3 : 4

  return (
    <div>
      <PageHeader title="Sacar Turno" subtitle="Elegí especialidad, médico y horario disponible" />

      <div className="flex flex-col lg:flex-row gap-5 max-w-3xl">
        {/* Left column — selects */}
        <div className="flex flex-col gap-4 lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
            <FormSelect
              label="Especialidad"
              value={specialtyId}
              onChange={e => setSpecialtyId(e.target.value)}
            >
              <option value="">Seleccioná una especialidad</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </FormSelect>

            {specialtyId && (
              <FormSelect
                label="Médico"
                value={doctorLicense}
                onChange={e => setDoctorLicense(e.target.value)}
                disabled={doctors.length === 0}
              >
                <option value="">
                  {doctors.length === 0 ? 'Sin médicos disponibles' : 'Seleccioná un médico'}
                </option>
                {doctors.map(d => (
                  <option key={d.licenseNumber} value={d.licenseNumber}>
                    {d.lastname}, {d.name}
                  </option>
                ))}
              </FormSelect>
            )}
          </div>

          {/* Confirm */}
          {step === 4 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
              {selectedSlot ? (
                <div className="rounded-xl bg-[#2a9d8f]/10 px-3 py-2.5 text-sm text-center">
                  <p className="font-semibold text-[#2a9d8f]">{formatTime(selectedSlot.scheduledAt)} hs</p>
                  <p className="text-xs text-gray-500 mt-0.5">{date}</p>
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center">Elegí un horario del calendario</p>
              )}
              {error && <Alert>{error}</Alert>}
              <button
                onClick={handleConfirm}
                disabled={!selectedSlot || loading}
                className="w-full bg-[#2a9d8f] hover:bg-[#238a7e] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-40 cursor-pointer text-sm"
              >
                {loading ? 'Confirmando...' : 'Confirmar turno'}
              </button>
            </div>
          )}
        </div>

        {/* Right column — calendar */}
        {doctorLicense && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex-1">
            <CalendarPicker
              selected={date}
              onSelect={setDate}
              highlightedDates={availabilityDates}
              fullyBookedDates={fullyBookedDates}
              disablePast
            />

            {/* Time slots */}
            {date && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                {loadingSlots ? (
                  <p className="text-sm text-gray-400">Buscando horarios...</p>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-gray-400">No hay horarios disponibles para ese día</p>
                ) : (
                  <>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Horarios del día
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {slots.map(slot => {
                        const active = selectedSlot?.scheduledAt === slot.scheduledAt
                        if (slot.booked) {
                          return (
                            <span
                              key={slot.scheduledAt}
                              className="px-4 py-2 rounded-lg text-sm border border-red-200 bg-red-50 text-red-300 cursor-not-allowed"
                            >
                              {formatTime(slot.scheduledAt)} hs
                            </span>
                          )
                        }
                        return (
                          <button
                            key={slot.scheduledAt}
                            type="button"
                            onClick={() => setSelectedSlot(active ? null : slot)}
                            className={`px-4 py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                              active
                                ? 'bg-[#2a9d8f] text-white border-[#2a9d8f]'
                                : 'border-gray-200 text-gray-700 hover:border-[#2a9d8f] hover:text-[#2a9d8f]'
                            }`}
                          >
                            {formatTime(slot.scheduledAt)} hs
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
