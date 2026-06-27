'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import { DoctorAdmin, Specialty } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { FormInput } from '@/components/ui/FormInput'
import { FormSelect } from '@/components/ui/FormSelect'
import { AdminListCard } from '@/components/admin/AdminListCard'
import { AdminFormPanel } from '@/components/admin/AdminFormPanel'

type FormMode = 'hidden' | 'create' | 'edit'

export default function AdminDoctorsPage() {
  const [doctors, setDoctors]         = useState<DoctorAdmin[]>([])
  const [filtered, setFiltered]       = useState<DoctorAdmin[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [search, setSearch]           = useState('')
  const [mode, setMode]               = useState<FormMode>('hidden')
  const [editing, setEditing]         = useState<DoctorAdmin | null>(null)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')
  const [success, setSuccess]         = useState('')

  const [dni, setDni]                     = useState('')
  const [name, setName]                   = useState('')
  const [lastname, setLastname]           = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [specialtyId, setSpecialtyId]     = useState('')
  const [password, setPassword]           = useState('')
  const [editSpecialtyId, setEditSpecialtyId] = useState('')

  useEffect(() => {
    Promise.all([api.doctors.getAll(), api.specialties.getAll()]).then(([docs, specs]) => {
      setDoctors(docs); setFiltered(docs); setSpecialties(specs)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      q ? doctors.filter(d =>
        d.name.toLowerCase().includes(q) ||
        d.lastname.toLowerCase().includes(q) ||
        String(d.licenseNumber).includes(q)
      ) : doctors
    )
  }, [search, doctors])

  const openCreate = () => {
    setDni(''); setName(''); setLastname(''); setLicenseNumber(''); setSpecialtyId(''); setPassword('')
    setError(''); setSuccess(''); setEditing(null); setMode('create')
  }

  const openEdit = (d: DoctorAdmin) => {
    setEditSpecialtyId(String(d.specialtyId))
    setError(''); setSuccess(''); setEditing(d); setMode('edit')
  }

  const closeForm = () => { setMode('hidden'); setEditing(null); setError('') }

  const refresh = async () => {
    const docs = await api.doctors.getAll()
    setDoctors(docs)
  }

  const handleCreate = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      await api.doctors.create({
        dni: Number(dni), name, lastname,
        licenseNumber: Number(licenseNumber),
        specialtyId: Number(specialtyId),
        password,
      })
      await refresh()
      setSuccess('Médico creado correctamente')
      setMode('hidden')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true); setError('')
    try {
      await api.doctors.update(editing.licenseNumber, { specialtyId: Number(editSpecialtyId) })
      await refresh()
      setSuccess('Médico actualizado')
      setMode('hidden')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Gestión de Médicos"
        action={
          mode === 'hidden' ? (
            <Button onClick={openCreate} className="flex items-center gap-1.5 text-sm px-4 py-2">
              <Plus size={15} />
              Nuevo médico
            </Button>
          ) : undefined
        }
      />

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {mode === 'create' && (
        <AdminFormPanel title="Nuevo médico" onClose={closeForm} error={error}>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <FormInput label="DNI *"        type="number"   value={dni}           onChange={e => setDni(e.target.value)}           required />
            <FormInput label="Nombre *"     type="text"     value={name}          onChange={e => setName(e.target.value)}          required />
            <FormInput label="Apellido *"   type="text"     value={lastname}      onChange={e => setLastname(e.target.value)}      required />
            <FormInput label="Matrícula *"  type="number"   value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} required />
            <FormInput label="Contraseña *" type="password" value={password}      onChange={e => setPassword(e.target.value)}      required showToggle />
            <FormSelect label="Especialidad *" value={specialtyId} onChange={e => setSpecialtyId(e.target.value)} required>
              <option value="">Seleccionar...</option>
              {specialties.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </FormSelect>
            <div className="col-span-2 flex gap-3 pt-1">
              <Button type="submit" loading={saving} loadingText="Guardando..." className="text-sm px-5 py-2">
                Crear médico
              </Button>
              <Button type="button" variant="ghost" onClick={closeForm} className="text-sm px-4 py-2 text-gray-500 hover:text-gray-700">
                Cancelar
              </Button>
            </div>
          </form>
        </AdminFormPanel>
      )}

      {mode === 'edit' && editing && (
        <AdminFormPanel
          title={`Editar — Dr. ${editing.lastname}, ${editing.name} (Mat. ${editing.licenseNumber})`}
          onClose={closeForm}
          error={error}
        >
          <form onSubmit={handleEdit} className="flex items-end gap-4">
            <div className="flex-1">
              <FormSelect label="Especialidad *" value={editSpecialtyId} onChange={e => setEditSpecialtyId(e.target.value)} required>
                {specialties.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </FormSelect>
            </div>
            <div className="flex gap-2 pb-0.5">
              <Button type="submit" loading={saving} loadingText="Guardando..." className="text-sm px-5 py-2.5">
                Guardar
              </Button>
              <Button type="button" variant="ghost" onClick={closeForm} className="text-sm px-4 py-2.5 text-gray-500">
                Cancelar
              </Button>
            </div>
          </form>
        </AdminFormPanel>
      )}

      <AdminListCard
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nombre o matrícula..."
        loading={loading}
        isEmpty={filtered.length === 0}
      >
        {filtered.map(d => (
          <div key={d.licenseNumber} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-8 rounded-full bg-[#e6f5f3] flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-[#2a9d8f]">{d.name[0]}{d.lastname[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1d3557]">
                Dr. {d.lastname}, {d.name}
                {!d.isActive && (
                  <span className="ml-2 text-xs bg-red-50 text-red-400 px-1.5 py-0.5 rounded">Inactivo</span>
                )}
              </p>
              <p className="text-xs text-gray-400">
                Mat. {d.licenseNumber} · {d.specialtyName}
                {d.email && <span className="ml-2">{d.email}</span>}
              </p>
            </div>
            <Button variant="outline" onClick={() => openEdit(d)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 shrink-0">
              <Pencil size={11} />
              Editar
            </Button>
          </div>
        ))}
      </AdminListCard>
    </div>
  )
}
