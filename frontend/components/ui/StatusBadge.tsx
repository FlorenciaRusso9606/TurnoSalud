import { AppointmentStatus } from '@/types'

const config: Record<AppointmentStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Pendiente',   className: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmado',  className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado',   className: 'bg-gray-100 text-gray-600' },
  ABSENT:    { label: 'Ausente',     className: 'bg-red-100 text-red-700' },
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { label, className } = config[status]
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${className}`}>
      {label}
    </span>
  )
}