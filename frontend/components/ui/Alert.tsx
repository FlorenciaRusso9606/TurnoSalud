interface Props {
  children: React.ReactNode
}

export function Alert({ children }: Props) {
  return (
    <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{children}</p>
  )
}
