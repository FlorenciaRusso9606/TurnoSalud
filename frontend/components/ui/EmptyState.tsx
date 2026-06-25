interface Props {
  message: string
  action?: React.ReactNode
}

export function EmptyState({ message, action }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <p className={`text-gray-600 ${action ? 'mb-4' : ''}`}>{message}</p>
      {action}
    </div>
  )
}
