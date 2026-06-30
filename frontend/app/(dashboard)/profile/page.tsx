'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type Profile = Awaited<ReturnType<typeof api.auth.me>>

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || <span className="text-gray-300">—</span>}</p>
    </div>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-5 py-3 bg-gray-50 border-b border-gray-200">
      <h2 className="text-xs font-semibold text-[#1d3557] uppercase tracking-wide">{title}</h2>
    </div>
  )
}

const ROLE_LABEL: Record<string, string> = {
  PATIENT: 'Paciente',
  DOCTOR:  'Médico',
  ADMIN:   'Administrador',
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.auth.me()
      .then(setProfile)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-400 text-sm p-8">Cargando perfil...</p>
  if (error)   return <p className="text-red-500 text-sm p-8">{error}</p>
  if (!profile) return null

  const age = profile.birthDate
    ? Math.floor((Date.now() - new Date(profile.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
    : null

  const birthDateFmt = profile.birthDate
    ? new Date(profile.birthDate).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null

  return (
    <div className="max-w-lg">
      {/* Encabezado */}
      <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <div className="bg-[#1d3557] px-5 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-white tracking-widest uppercase">
            Mi Perfil
          </span>
          <span className="text-[11px] text-white/50">Hospital Cervantes · Río Negro</span>
        </div>

        <div className="px-5 py-5">
          <h1 className="text-lg font-bold text-[#1d3557] border-b border-gray-100 pb-3 mb-4">
            {profile.lastname.toUpperCase()}, {profile.name}
          </h1>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Field label="DNI"  value={profile.dni.toString()} />
            <Field label="Rol"  value={ROLE_LABEL[profile.role] ?? profile.role} />
            <Field label="Correo electrónico" value={profile.email} />
            <Field label="Teléfono"           value={profile.phone} />
            <Field label="Dirección"          value={profile.address} />
          </div>
        </div>
      </div>

      {/* Datos según rol */}
      {profile.role === 'PATIENT' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader title="Datos del paciente" />
          <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-4">
            <Field
              label="Fecha de nacimiento"
              value={birthDateFmt ? `${birthDateFmt} (${age} años)` : null}
            />
            <Field label="Obra social" value={profile.socialWork} />
          </div>
        </div>
      )}

      {profile.role === 'DOCTOR' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader title="Datos profesionales" />
          <div className="px-5 py-5 grid grid-cols-2 gap-x-8 gap-y-4">
            <Field label="Matrícula"    value={profile.licenseNumber?.toString()} />
            <Field label="Especialidad" value={profile.specialtyName} />
          </div>
        </div>
      )}
    </div>
  )
}
