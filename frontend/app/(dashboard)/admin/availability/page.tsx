'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { DoctorSearch } from '@/components/admin/DoctorSearch'
import { DoctorCard } from '@/components/admin/DoctorCard'
import { DoctorDetail, DoctorAvailability } from '@/types'

export default function DisponibilidadPage() {
  const [doctor, setDoctor] = useState<DoctorDetail | null>(null)
  const [availability, setAvailability] = useState<DoctorAvailability[]>([])
  const [loadingDoctor, setLoadingDoctor] = useState(false)

  async function handleSelect(d: DoctorDetail | null) {
    if (!d) { setDoctor(null); setAvailability([]); return }
    setDoctor(d)
    setLoadingDoctor(true)
    try {
      const av = await api.availability.getByDoctor(d.licenseNumber)
      setAvailability(av)
    } catch {
      setAvailability([])
    } finally {
      setLoadingDoctor(false)
    }
  }

  function handleRefresh() {
    if (doctor) handleSelect(doctor)
  }

  return (
    <div>
      <PageHeader
        title="Disponibilidad Médicos"
        subtitle="Buscá un médico y gestioná sus horarios de atención"
      />

      <DoctorSearch onSelect={handleSelect} disabled={loadingDoctor} />

      {doctor && (
        <DoctorCard
          doctor={doctor}
          availability={availability}
          loading={loadingDoctor}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  )
}
