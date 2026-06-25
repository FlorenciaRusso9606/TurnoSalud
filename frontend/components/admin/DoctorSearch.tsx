'use client'

import { api } from '@/lib/api'
import { EntitySearch } from '@/components/ui/EntitySearch'
import { DoctorDetail } from '@/types'

interface Props {
  onSelect: (doctor: DoctorDetail) => void
  disabled?: boolean
}

async function searchDoctor(q: string): Promise<DoctorDetail[]> {
  if (/^\d+$/.test(q)) {
    try {
      const found = await api.doctors.getByLicense(Number(q))
      return [found]
    } catch {
      throw new Error('No se encontró ningún médico con esa matrícula')
    }
  }
  return api.doctors.search(q)
}

export function DoctorSearch({ onSelect, disabled }: Props) {
  return (
    <div className="max-w-lg mb-6">
      <EntitySearch<DoctorDetail>
        searchFn={searchDoctor}
        getKey={d => d.licenseNumber}
        renderResult={d => (
          <>
            <span className="text-sm font-medium text-gray-800">Dr. {d.name} {d.lastname}</span>
            <span className="ml-2 text-xs text-gray-400">Mat. {d.licenseNumber} · {d.specialty.name}</span>
          </>
        )}
        onSelect={item => { if (item) onSelect(item) }}
        placeholder="Buscar por nombre, apellido o matrícula..."
        notFoundMessage="No se encontraron médicos con ese nombre"
        disabled={disabled}
      />
    </div>
  )
}
