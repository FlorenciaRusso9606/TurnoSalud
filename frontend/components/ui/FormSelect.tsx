interface Props extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: React.ReactNode
}

export function FormSelect({ label, children, ...props }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        {...props}
        className="w-full px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] focus:border-transparent"
      >
        {children}
      </select>
    </div>
  )
}
