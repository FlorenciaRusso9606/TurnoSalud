interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
}

export function FormTextarea({ label, ...props }: Props) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        {...props}
        className="w-full px-4 py-2.5 border  text-gray-900 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2a9d8f] resize-none"
      />
    </div>
  )
}
