'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  showToggle?: boolean
  error?: string
}

export function FormInput({ label, showToggle, error, type, ...props }: Props) {
  const [visible, setVisible] = useState(false)

  const inputType = showToggle ? (visible ? 'text' : 'password') : type

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`w-full px-4 py-2.5 border text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent pr-10 ${
            error
              ? 'border-red-400 focus:ring-red-300'
              : 'border-gray-200 focus:ring-[#2a9d8f]'
          }`}
        />
        {showToggle && (
          <button
            type="button"
            onClick={() => setVisible(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            tabIndex={-1}
            aria-label={visible ? 'Ocultar contraseña' : 'Ver contraseña'}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
