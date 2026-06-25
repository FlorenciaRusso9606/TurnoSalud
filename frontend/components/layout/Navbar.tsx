'use client'

import { LogOut, Plus } from 'lucide-react'
import { logout, getTokenPayload } from '@/lib/auth'

export function Navbar() {
  const payload = getTokenPayload()
  const initials = payload ? `${payload.name[0]}${payload.lastname[0]}`.toUpperCase() : '?'

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#2a9d8f] rounded-lg flex items-center justify-center">
          <Plus size={18} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-[#1d3557] text-lg">TurnoSalud</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2a9d8f] flex items-center justify-center">
          <span className="text-white text-xs font-semibold">{initials}</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm text-red-800 p-2 rounded-xl hover:bg-red-200 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </header>
  )
}
