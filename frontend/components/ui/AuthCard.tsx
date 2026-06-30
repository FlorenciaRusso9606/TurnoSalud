import { Plus } from 'lucide-react'

interface Props {
  title: string
  subtitle: string
  children: React.ReactNode
  cardClassName?: string
}

export function AuthCard({ title, subtitle, children, cardClassName }: Props) {
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 bg-[#2a9d8f] rounded-2xl flex items-center justify-center mb-3">
          <Plus className="text-white" size={28} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-[#1d3557]">Hospital Cervantes</h1>
        <p className="text-sm text-gray-500">Río Negro · Argentina</p>
      </div>

      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm p-8 ${cardClassName ?? 'h-110'}`}>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>
        {children}
      </div>

      <p className="text-xs text-gray-400 mt-6">Ministerio de Salud · Provincia Río Negro</p>
    </div>
  )
}
