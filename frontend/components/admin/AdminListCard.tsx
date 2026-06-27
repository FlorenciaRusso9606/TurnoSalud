'use client'

import { Search, X } from 'lucide-react'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  placeholder?: string
  loading?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: React.ReactNode
}

export function AdminListCard({
  search,
  onSearchChange,
  placeholder = 'Buscar...',
  loading,
  isEmpty,
  emptyMessage = 'Sin resultados',
  children,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <Search size={15} className="text-gray-400 shrink-0" />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="text-gray-400 hover:text-gray-600 cursor-pointer shrink-0"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400 px-5 py-6">Cargando...</p>
      ) : isEmpty ? (
        <p className="text-sm text-gray-400 px-5 py-6">{emptyMessage}</p>
      ) : (
        <div className="divide-y divide-gray-50">{children}</div>
      )}
    </div>
  )
}
