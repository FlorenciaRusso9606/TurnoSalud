'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { getTokenPayload } from '@/lib/auth'
import { studyUploadSchema } from '@/lib/schemas'
import { PageHeader } from '@/components/ui/PageHeader'
import { FormInput } from '@/components/ui/FormInput'
import { FormSelect } from '@/components/ui/FormSelect'
import { FormTextarea } from '@/components/ui/FormTextarea'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import { PatientSearch } from '@/components/admin/PatientSearch'
import { StudyDropzone } from '@/components/admin/StudyDropzone'
import { EntitySearch } from '@/components/ui/EntitySearch'
import { Patient, StudyType, DoctorDetail } from '@/types'

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

const EMPTY_FORM = {
  studyTypeId:  0,
  title:        '',
  description:  '',
  institution:  '',
  performedAt:  '',
}

export default function AdminEstudiosPage() {
  const me = getTokenPayload()
  const isDoctor = me?.role === 'DOCTOR'

  const [patient, setPatient]             = useState<Patient | null>(null)
  const [studyTypes, setStudyTypes]       = useState<StudyType[]>([])
  const [file, setFile]                   = useState<File | null>(null)
  const [fileError, setFileError]         = useState('')
  const [responsibleDoctor, setResponsibleDoctor] = useState<DoctorDetail | null>(null)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [error, setError]                 = useState('')
  const [loading, setLoading]             = useState(false)

  useEffect(() => {
    api.studyTypes.getAll().then(setStudyTypes).catch(() => {})
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm(prev => ({ ...prev, [e.target.name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setFileError('')

    if (!file) {
      setFileError('El archivo PDF es requerido')
      return
    }

    const responsibleDoctorLicense =
      isDoctor && me?.licenseNumber
        ? me.licenseNumber
        : responsibleDoctor?.licenseNumber ?? 0

    const validation = studyUploadSchema.safeParse({
      patientDni:               patient?.dni ?? 0,
      studyTypeId:              Number(form.studyTypeId),
      title:                    form.title,
      description:              form.description || undefined,
      institution:              form.institution,
      performedAt:              form.performedAt,
      responsibleDoctorLicense,
    })

    if (!validation.success) {
      setError(validation.error.issues[0].message)
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('patientDni',               String(validation.data.patientDni))
    formData.append('studyTypeId',              String(validation.data.studyTypeId))
    formData.append('title',                    validation.data.title)
    formData.append('institution',              validation.data.institution)
    formData.append('performedAt',              validation.data.performedAt)
    formData.append('responsibleDoctorLicense', String(validation.data.responsibleDoctorLicense))
    if (validation.data.description) {
      formData.append('description', validation.data.description)
    }

    setLoading(true)
    try {
      await api.studies.upload(formData)
      toast.success('Estudio cargado correctamente')
      setPatient(null)
      setFile(null)
      setResponsibleDoctor(null)
      setForm(EMPTY_FORM)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = !!patient

  return (
    <div>
      <PageHeader title="Cargar Estudio" subtitle="Asociá un resultado médico a un paciente" />

      <form onSubmit={handleSubmit}>
        <div className="flex gap-6 items-start">

          <div className="w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Paciente</p>
              <PatientSearch selected={patient} onSelect={setPatient} disabled={loading} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className={[
              'bg-white rounded-2xl border p-5 transition-opacity',
              !canSubmit ? 'border-gray-100 opacity-60 pointer-events-none' : 'border-gray-100',
            ].join(' ')}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-5">Datos del estudio</p>

              <div className="flex flex-col gap-4">
                {/* Tipo + Título */}
                <div className="grid grid-cols-2 gap-4">
                  <FormSelect
                    label="Tipo de estudio"
                    name="studyTypeId"
                    value={String(form.studyTypeId)}
                    onChange={handleChange as React.ChangeEventHandler<HTMLSelectElement>}
                  >
                    <option value="0" disabled>Seleccioná un tipo</option>
                    {studyTypes.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </FormSelect>

                  <FormInput
                    label="Nombre del estudio"
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
                    placeholder="Ej. Hemograma completo"
                  />
                </div>

                {/* Institución + Fecha */}
                <div className="grid grid-cols-2 gap-4">
                  <FormInput
                    label="Laboratorio / Institución"
                    type="text"
                    name="institution"
                    value={form.institution}
                    onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
                    placeholder="Ej. Laboratorio Central"
                  />
                  <FormInput
                    label="Fecha de realización"
                    type="date"
                    name="performedAt"
                    value={form.performedAt}
                    onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Profesional responsable */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1.5">Profesional responsable</p>
                  {isDoctor ? (
                    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                      <p className="text-sm text-gray-700">
                        Dr. {me?.name} {me?.lastname}
                        <span className="ml-2 text-xs text-gray-400">Mat. {me?.licenseNumber}</span>
                      </p>
                    </div>
                  ) : responsibleDoctor ? (
                    <div className="flex items-center justify-between rounded-lg border border-[#2a9d8f]/20 bg-[#2a9d8f]/5 px-3 py-2.5">
                      <p className="text-sm text-gray-700">
                        Dr. {responsibleDoctor.name} {responsibleDoctor.lastname}
                        <span className="ml-2 text-xs text-gray-400">Mat. {responsibleDoctor.licenseNumber}</span>
                      </p>
                      <button type="button" onClick={() => setResponsibleDoctor(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={15} />
                      </button>
                    </div>
                  ) : (
                    <EntitySearch<DoctorDetail>
                      searchFn={searchDoctor}
                      getKey={d => d.licenseNumber}
                      renderResult={d => (
                        <>
                          <span className="text-sm font-medium text-gray-800">Dr. {d.name} {d.lastname}</span>
                          <span className="ml-2 text-xs text-gray-400">Mat. {d.licenseNumber} · {d.specialty.name}</span>
                        </>
                      )}
                      onSelect={item => { if (item) setResponsibleDoctor(item) }}
                      placeholder="Buscar por nombre, apellido o matrícula..."
                      notFoundMessage="No se encontraron médicos"
                      disabled={loading}
                    />
                  )}
                </div>

                {/* Observaciones */}
                <FormTextarea
                  label="Observaciones (opcional)"
                  name="description"
                  value={form.description}
                  onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
                  placeholder="Hallazgos o indicaciones adicionales..."
                  rows={3}
                />

                {/* Dropzone */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1.5">Adjuntar resultado (PDF)</p>
                  <StudyDropzone file={file} onChange={setFile} error={fileError} />
                </div>

                {error && <Alert>{error}</Alert>}

                <Button
                  type="submit"
                  disabled={!canSubmit}
                  loading={loading}
                  loadingText="Subiendo estudio..."
                  className="w-full py-2.5 mt-1"
                >
                  Cargar estudio
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
