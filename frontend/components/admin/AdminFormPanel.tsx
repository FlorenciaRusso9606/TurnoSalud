import { X } from 'lucide-react'
import { Alert } from '@/components/ui/Alert'

interface Props {
  title: string
  onClose: () => void
  error?: string
  children: React.ReactNode
}

export function AdminFormPanel({ title, onClose, error, children }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-[#1d3557]">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <X size={18} />
        </button>
      </div>
      {error && <div className="mb-4"><Alert>{error}</Alert></div>}
      {children}
    </div>
  )
}
