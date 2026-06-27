'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserRound } from 'lucide-react'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { AdminListCard } from '@/components/admin/AdminListCard'
import { Patient } from '@/types'

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    api.patients.getAll()
      .then(setPatients)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const q = search.trim().toLowerCase()
  const filtered = q
    ? patients.filter(p =>
        p.lastname.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        String(p.dni).includes(q)
      )
    : patients

  return (
    <div className="max-w-2xl">
      <PageHeader title="Pacientes" subtitle="Listado de pacientes registrados" />

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <AdminListCard
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nombre, apellido o DNI..."
        loading={loading}
        isEmpty={!loading && filtered.length === 0}
        emptyMessage={q ? 'No se encontraron pacientes con ese criterio' : 'No hay pacientes registrados'}
      >
        {filtered.map(p => (
          <div key={p.dni} className="flex items-center gap-4 px-5 py-4">
            <div className="flex-1">
              <p className="font-semibold text-[#1d3557]">{p.lastname}, {p.name}</p>
              <p className="text-sm text-gray-400">
                DNI {p.dni}
                {p.socialWork && <span className="ml-2">{p.socialWork}</span>}
              </p>
            </div>
            <Link
              href={`/doctor/patients/${p.dni}`}
              className="flex items-center gap-1.5 text-sm border border-gray-200 hover:border-[#2a9d8f] hover:text-[#2a9d8f] px-4 py-1.5 rounded-lg transition-colors shrink-0"
            >
              <UserRound size={14} />
              Ver ficha
            </Link>
          </div>
        ))}
      </AdminListCard>
    </div>
  )
}
