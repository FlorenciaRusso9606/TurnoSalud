interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'success' | 'danger'
  loading?: boolean
  loadingText?: string
}

const variantClass = {
  primary: 'bg-[#2a9d8f] hover:bg-[#238a7e] text-white rounded-lg font-medium transition-colors disabled:opacity-60 cursor-pointer',
  outline: 'border border-[#2a9d8f] text-[#2a9d8f] hover:bg-[#2a9d8f]/5 rounded-lg font-medium transition-colors cursor-pointer',
  ghost:   'text-gray-400 hover:text-gray-600 transition-colors cursor-pointer',
  success: 'bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-medium transition-colors disabled:opacity-60 cursor-pointer',
  danger:  'bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors disabled:opacity-60 cursor-pointer',
}

export function Button({ variant = 'primary', loading, loadingText, children, className = '', disabled, ...props }: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`${variantClass[variant]} ${className}`}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
