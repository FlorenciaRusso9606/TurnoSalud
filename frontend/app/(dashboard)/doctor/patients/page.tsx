'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Search, FileText } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Patient } from '@/types'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.patients.getAll()
      .then(setPatients)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? patients.filter(p =>
        p.lastname.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        String(p.dni).includes(q)
      )
    : patients

  return (
    <div>
      <PageHeader title="Pacientes" subtitle="Listado de pacientes registrados" />

      {loading && <p className="text-gray-400 text-sm">Cargando pacientes...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && (
        <div className="relative max-w-2xl mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent"
          />
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">
            {q ? 'No se encontraron pacientes con ese criterio' : 'No hay pacientes registrados'}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-2xl">
        {filtered.map(p => (
          <div
            key={p.dni}
            className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center gap-4"
          >
            <div className="flex-1">
              <p className="font-semibold text-[#1d3557]">
                {p.lastname}, {p.name}
              </p>
              <p className="text-sm text-gray-400">DNI {p.dni}</p>
              {p.socialWork && (
                <p className="text-xs text-gray-400">{p.socialWork}</p>
              )}
            </div>

            <Link
              href={`/doctor/patients/${p.dni}/studies`}
              className="flex items-center gap-1.5 text-sm border border-gray-200 hover:border-[#2a9d8f] hover:text-[#2a9d8f] px-4 py-1.5 rounded-lg transition-colors"
            >
              <FileText size={14} />
              Estudios
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
