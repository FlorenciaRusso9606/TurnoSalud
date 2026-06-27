'use client'

import { useEffect, useState } from 'react'
import { BookOpen, Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { api } from '@/lib/api'
import { Specialty } from '@/types'

export default function AdminSpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading]         = useState(true)
  const [newName, setNewName]         = useState('')
  const [adding, setAdding]           = useState(false)
  const [editingId, setEditingId]     = useState<number | null>(null)
  const [editName, setEditName]       = useState('')
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState('')

  const refresh = () =>
    api.specialties.getAll().then(setSpecialties).finally(() => setLoading(false))

  useEffect(() => { refresh() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return
    setSaving(true)
    setError('')
    try {
      await api.specialties.create({ name: newName.trim() })
      setNewName('')
      setAdding(false)
      await refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (s: Specialty) => {
    setEditingId(s.id)
    setEditName(s.name)
    setError('')
  }

  const handleEdit = async (id: number) => {
    if (!editName.trim()) return
    setSaving(true)
    setError('')
    try {
      await api.specialties.update(id, { name: editName.trim() })
      setEditingId(null)
      await refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return
    setError('')
    try {
      await api.specialties.delete(id)
      await refresh()
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-[#2a9d8f]" />
          <h1 className="text-xl font-bold text-[#1d3557]">Especialidades</h1>
        </div>
        {!adding && (
          <button onClick={() => { setAdding(true); setError('') }}
            className="flex items-center gap-1.5 bg-[#2a9d8f] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#238a7e] transition-colors cursor-pointer">
            <Plus size={15} />
            Nueva
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Add form */}
        {adding && (
          <form onSubmit={handleAdd} className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-[#f8fdfc]">
            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre de la especialidad..."
              className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2a9d8f]"
            />
            <button type="submit" disabled={saving || !newName.trim()}
              className="p-1.5 text-white bg-[#2a9d8f] rounded-lg hover:bg-[#238a7e] disabled:opacity-50 cursor-pointer transition-colors">
              <Check size={15} />
            </button>
            <button type="button" onClick={() => { setAdding(false); setNewName('') }}
              className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={15} />
            </button>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-gray-400 px-5 py-6">Cargando...</p>
        ) : specialties.length === 0 ? (
          <p className="text-sm text-gray-400 px-5 py-6">Sin especialidades registradas</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {specialties.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-4 py-3">
                {editingId === s.id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#2a9d8f]"
                      onKeyDown={e => { if (e.key === 'Enter') handleEdit(s.id); if (e.key === 'Escape') setEditingId(null) }}
                    />
                    <button onClick={() => handleEdit(s.id)} disabled={saving}
                      className="p-1.5 text-white bg-[#2a9d8f] rounded-lg hover:bg-[#238a7e] disabled:opacity-50 cursor-pointer">
                      <Check size={14} />
                    </button>
                    <button onClick={() => setEditingId(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 cursor-pointer">
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm text-[#1d3557]">{s.name}</span>
                    <button onClick={() => startEdit(s)}
                      className="p-1.5 text-gray-400 hover:text-[#2a9d8f] cursor-pointer transition-colors">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(s.id, s.name)}
                      className="p-1.5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
