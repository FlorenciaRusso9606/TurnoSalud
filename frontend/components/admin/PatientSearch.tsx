'use client'

import { X } from 'lucide-react'
import { api } from '@/lib/api'
import { EntitySearch } from '@/components/ui/EntitySearch'
import { Patient } from '@/types'

interface Props {
  selected: Patient | null
  onSelect: (patient: Patient | null) => void
  disabled?: boolean
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function SelectedPatientCard({ patient, onClear }: { patient: Patient; onClear: () => void }) {
  return (
    <div className="rounded-xl bg-[#2a9d8f]/8 border border-[#2a9d8f]/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2a9d8f] text-white text-sm font-semibold">
            {patient.name[0]}{patient.lastname[0]}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{patient.name} {patient.lastname}</p>
            <p className="text-xs text-gray-500 mt-0.5">DNI: {patient.dni}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5"
          title="Cambiar paciente"
        >
          <X size={16} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 pl-13">
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Fecha de nac.</p>
          <p className="text-sm text-gray-700">{formatDate(patient.birthDate)}</p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Obra social</p>
          <p className="text-sm text-gray-700">{patient.socialWork ?? '—'}</p>
        </div>
      </div>
    </div>
  )
}

export function PatientSearch({ selected, onSelect, disabled }: Props) {
  return (
    <EntitySearch<Patient>
      searchFn={q => api.patients.search(q)}
      getKey={p => p.dni}
      renderResult={p => (
        <>
          <span className="text-sm font-medium text-gray-800">{p.name} {p.lastname}</span>
          <span className="ml-2 text-xs text-gray-400">DNI {p.dni}</span>
          {p.socialWork && <span className="ml-2 text-xs text-gray-400">· {p.socialWork}</span>}
        </>
      )}
      selected={selected}
      onSelect={onSelect}
      renderSelected={(patient, onClear) => (
        <SelectedPatientCard patient={patient} onClear={onClear} />
      )}
      placeholder="Nombre, apellido o DNI..."
      notFoundMessage="No se encontraron pacientes"
      disabled={disabled}
    />
  )
}
