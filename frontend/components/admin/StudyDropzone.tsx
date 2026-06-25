'use client'

import { useRef, useState } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'

const MAX_SIZE_MB = 20
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

interface Props {
  file: File | null
  onChange: (file: File | null) => void
  error?: string
}

export function StudyDropzone({ file, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  function validate(f: File): string | null {
    if (f.type !== 'application/pdf') return 'El archivo debe ser PDF'
    if (f.size > MAX_SIZE_BYTES) return `El archivo no puede superar los ${MAX_SIZE_MB} MB`
    return null
  }

  function handleFile(f: File) {
    const err = validate(f)
    if (err) { setLocalError(err); return }
    setLocalError('')
    onChange(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (selected) handleFile(selected)
    e.target.value = ''
  }

  const displayError = localError || error

  if (file) {
    return (
      <div className="rounded-xl border border-[#2a9d8f]/30 bg-[#2a9d8f]/5 px-4 py-3 flex items-center gap-3">
        <FileText size={20} className="text-[#2a9d8f] flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
          <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          type="button"
          onClick={() => { onChange(null); setLocalError('') }}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <X size={16} />
        </button>
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={[
          'w-full rounded-xl border-2 border-dashed px-6 py-8 flex flex-col items-center gap-3 transition-colors cursor-pointer',
          dragging
            ? 'border-[#2a9d8f] bg-[#2a9d8f]/5'
            : displayError
            ? 'border-red-300 bg-red-50'
            : 'border-gray-200 hover:border-[#2a9d8f]/50 hover:bg-gray-50',
        ].join(' ')}
      >
        <UploadCloud
          size={28}
          className={dragging ? 'text-[#2a9d8f]' : displayError ? 'text-red-400' : 'text-gray-300'}
        />
        <div className="text-center">
          <p className="text-sm font-medium text-gray-600">
            Arrastrá el PDF aquí
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            o <span className="text-[#2a9d8f] font-medium">seleccioná el archivo</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">Solo PDF · máx. {MAX_SIZE_MB} MB</p>
        </div>
      </button>

      {displayError && (
        <p className="mt-1.5 text-xs text-red-500">{displayError}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
