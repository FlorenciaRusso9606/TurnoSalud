'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { PageHeader } from '@/components/ui/PageHeader'
import { Study } from '@/types'

async function openStudy(studyId: string) {
  try {
    const { url } = await api.studies.getDownloadUrl(studyId)
    window.open(url, '_blank')
  } catch (e: any) {
    alert(e.message)
  }
}

export default function PatientStudiesPage() {
  const params = useParams()
  const dni = Number(params.dni)

  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!dni) return
    api.studies.getByPatient(dni)
      .then(setStudies)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [dni])

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric'
    })
  }

  return (
    <div>
      <PageHeader
        title={`Estudios del paciente`}
        subtitle={`DNI ${dni}`}
      />

      {loading && <p className="text-gray-400 text-sm">Cargando estudios...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {!loading && studies.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">Este paciente no tiene estudios cargados</p>
        </div>
      )}

      <div className="flex flex-col gap-3 max-w-2xl">
        {studies.map(study => (
          <div
            key={study.id}
            className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-orange-500 text-xs font-bold">PDF</span>
            </div>

            <div className="flex-1">
              <p className="font-semibold text-[#1d3557]">{study.title}</p>
              {study.description && (
                <p className="text-xs text-gray-400 mt-0.5">{study.description}</p>
              )}
              <p className="text-sm text-gray-400">{formatDate(study.performedAt)}</p>
            </div>

            <button
              type="button"
              onClick={() => openStudy(study.id)}
              className="text-sm border border-gray-200 hover:border-[#2a9d8f] hover:text-[#2a9d8f] px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
