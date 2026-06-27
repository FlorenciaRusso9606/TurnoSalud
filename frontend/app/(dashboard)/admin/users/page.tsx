'use client'

import { useEffect, useState } from 'react'
import { UserCog, ToggleLeft, ToggleRight, Pencil, KeyRound } from 'lucide-react'
import { api } from '@/lib/api'
import { UserAdmin } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { FormInput } from '@/components/ui/FormInput'
import { Alert } from '@/components/ui/Alert'
import { AdminListCard } from '@/components/admin/AdminListCard'

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Médico',
  PATIENT: 'Paciente',
}

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-purple-50 text-purple-600',
  DOCTOR: 'bg-blue-50 text-blue-600',
  PATIENT: 'bg-gray-50 text-gray-500',
}

export default function AdminUsersPage() {
  const [users, setUsers]         = useState<UserAdmin[]>([])
  const [filtered, setFiltered]   = useState<UserAdmin[]>([])
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editEmail, setEditEmail]     = useState('')
  const [editPhone, setEditPhone]     = useState('')
  const [editAddress, setEditAddress] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const refresh = () =>
    api.users.getAll().then(data => { setUsers(data); setFiltered(data) }).finally(() => setLoading(false))

  useEffect(() => { refresh() }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(
      q ? users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.lastname.toLowerCase().includes(q) ||
        String(u.dni).includes(q) ||
        u.role.toLowerCase().includes(q)
      ) : users
    )
  }, [search, users])

  const toggleActive = async (u: UserAdmin) => {
    setError('')
    try {
      await api.users.update(u.id, { isActive: !u.isActive })
      await refresh()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const startEdit = (u: UserAdmin) => {
    setEditingId(u.id)
    setEditEmail(u.email ?? '')
    setEditPhone(u.phone ?? '')
    setEditAddress(u.address ?? '')
    setNewPassword('')
    setError('')
  }

  const handleSaveEdit = async (id: number) => {
    setSaving(true); setError('')
    try {
      await api.users.update(id, {
        email:    editEmail || null,
        phone:    editPhone || null,
        address:  editAddress || null,
        password: newPassword || undefined,
      })
      setEditingId(null)
      await refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <PageHeader title="Gestión de Usuarios" />

      {error && <div className="mb-4"><Alert>{error}</Alert></div>}

      <AdminListCard
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nombre, DNI o rol..."
        loading={loading}
        isEmpty={filtered.length === 0}
      >
        {filtered.map(u => (
          <div key={u.id}>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <div className="w-8 h-8 rounded-full bg-[#e6f5f3] flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-[#2a9d8f]">{u.name[0]}{u.lastname[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[#1d3557]">{u.lastname}, {u.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${ROLE_COLOR[u.role]}`}>
                    {ROLE_LABEL[u.role]}
                  </span>
                  {!u.isActive && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-400 font-medium">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  DNI: {u.dni}
                  {u.email && <span className="ml-2">{u.email}</span>}
                  {u.phone && <span className="ml-2">{u.phone}</span>}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(u)}
                  title={u.isActive ? 'Desactivar cuenta' : 'Activar cuenta'}
                  className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  {u.isActive
                    ? <ToggleRight size={20} className="text-[#2a9d8f]" />
                    : <ToggleLeft size={20} className="text-gray-300" />}
                </button>
                <button
                  onClick={() => editingId === u.id ? setEditingId(null) : startEdit(u)}
                  title="Editar contacto / contraseña"
                  className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Pencil size={15} className={editingId === u.id ? 'text-[#2a9d8f]' : 'text-gray-400'} />
                </button>
              </div>
            </div>

            {editingId === u.id && (
              <div className="px-5 pb-5 pt-1 bg-gray-50/60 border-t border-gray-50">
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <FormInput label="Email"     type="email" value={editEmail}   onChange={e => setEditEmail(e.target.value)}   />
                  <FormInput label="Teléfono"  type="text"  value={editPhone}   onChange={e => setEditPhone(e.target.value)}   />
                  <FormInput label="Dirección" type="text"  value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                </div>
                <div className="flex items-end gap-3">
                  <div className="flex-1 max-w-xs">
                    <FormInput
                      label={`Nueva contraseña (opcional)`}
                      type="password"
                      showToggle
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Dejar vacío para no cambiar"
                    />
                  </div>
                  <div className="flex gap-2 pb-0.5">
                    <Button
                      onClick={() => handleSaveEdit(u.id)}
                      loading={saving}
                      loadingText="Guardando..."
                      className="flex items-center gap-1 text-sm px-4 py-2.5"
                    >
                      <KeyRound size={13} />
                      Guardar
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                      className="text-sm px-3 py-2.5 text-gray-500"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </AdminListCard>
    </div>
  )
}
