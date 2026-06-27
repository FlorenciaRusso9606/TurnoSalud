'use client'

import { useEffect, useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { api } from '@/lib/api'
import { Study } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatShortDate } from '@/lib/dateUtils'

async function openStudy(studyId: string) {
  const { url } = await api.studies.getDownloadUrl(studyId)
  window.open(url, '_blank')
}

export default function MisEstudiosPage() {
  const [studies, setStudies] = useState<Study[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.studies.getMine()
      .then(setStudies)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader title="Mis Estudios" subtitle="Resultados y documentos cargados por el hospital" />

      {loading && <p className="text-gray-400 text-sm">Cargando estudios...</p>}

      {!loading && studies.length === 0 && (
        <EmptyState message="No tenés estudios cargados todavía" />
      )}

      <div className="flex flex-col gap-3 max-w-2xl">
        {studies.map(study => (
          <div
            key={study.id}
            className="bg-white rounded-2xl border border-gray-100 px-6 py-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={20} className="text-orange-500" />
            </div>

            <div className="flex-1">
              <p className="font-semibold text-[#1d3557]">{study.title}</p>
              <p className="text-sm text-gray-400">{formatShortDate(study.performedAt)}</p>
            </div>

            <button
              type="button"
              onClick={() => openStudy(study.id)}
              className="flex items-center gap-1.5 text-sm border border-gray-200 hover:border-[#2a9d8f] hover:text-[#2a9d8f] px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Download size={14} />
              Descargar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
