'use client'

import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { EntitySearch } from '@/components/ui/EntitySearch'
import { DoctorDetail } from '@/types'

interface Props {
  selected?: DoctorDetail | null
  onSelect: (doctor: DoctorDetail | null) => void
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

function SelectedDoctorChip({ doctor, onClear }: { doctor: DoctorDetail; onClear: () => void }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-[#e6f5f3] border border-[#2a9d8f]/20 rounded-lg">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#1d3557]">Dr./Dra. {doctor.lastname}, {doctor.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">Mat. {doctor.licenseNumber} · {doctor.specialty.name}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
        title="Quitar filtro"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function DoctorSearch({ selected, onSelect, disabled }: Props) {
  return (
    <EntitySearch<DoctorDetail>
      searchFn={searchDoctor}
      getKey={d => d.licenseNumber}
      renderResult={d => (
        <>
          <span className="text-sm font-medium text-gray-800">Dr./Dra. {d.lastname}, {d.name}</span>
          <span className="ml-2 text-xs text-gray-400">Mat. {d.licenseNumber} · {d.specialty.name}</span>
        </>
      )}
      selected={selected}
      renderSelected={(d, onClear) => <SelectedDoctorChip doctor={d} onClear={onClear} />}
      onSelect={item => onSelect(item)}
      placeholder="Buscar por nombre, apellido o matrícula..."
      notFoundMessage="No se encontraron médicos con ese nombre"
      disabled={disabled}
    />
  )
}
