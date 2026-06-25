'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Props<T> {
  searchFn: (q: string) => Promise<T[]>
  getKey: (item: T) => string | number
  renderResult: (item: T) => React.ReactNode
  onSelect: (item: T | null) => void
  selected?: T | null
  renderSelected?: (item: T, onClear: () => void) => React.ReactNode
  placeholder?: string
  notFoundMessage?: string
  disabled?: boolean
}

export function EntitySearch<T>({
  searchFn,
  getKey,
  renderResult,
  onSelect,
  selected,
  renderSelected,
  placeholder = 'Buscar...',
  notFoundMessage = 'No se encontraron resultados',
  disabled,
}: Props<T>) {
  const [query, setQuery]     = useState('')
  const [results, setResults] = useState<T[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError]     = useState('')

  async function handleSearch() {
    const q = query.trim()
    if (!q) return
    setError('')
    setResults([])
    setSearching(true)
    try {
      const found = await searchFn(q)
      if (found.length === 0) {
        setError(notFoundMessage)
      } else if (found.length === 1) {
        onSelect(found[0])
        setQuery('')
      } else {
        setResults(found)
      }
    } catch (err: any) {
      setError(err.message ?? 'Error al buscar')
    } finally {
      setSearching(false)
    }
  }

  function handleClear() {
    onSelect(null)
    setQuery('')
    setResults([])
    setError('')
  }

  if (selected && renderSelected) {
    return <>{renderSelected(selected, handleClear)}</>
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setError('') }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent disabled:opacity-50"
          />
        </div>
        <Button
          type="button"
          onClick={handleSearch}
          disabled={searching || disabled}
          loading={searching}
          loadingText="Buscando..."
          className="px-4 py-2.5 text-sm"
        >
          Buscar
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {results.length > 0 && (
        <ul className="mt-2 rounded-lg border border-gray-200 bg-white divide-y divide-gray-100 shadow-sm">
          {results.map(item => (
            <li key={getKey(item)}>
              <button
                type="button"
                onClick={() => { onSelect(item); setResults([]); setQuery('') }}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                {renderResult(item)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
