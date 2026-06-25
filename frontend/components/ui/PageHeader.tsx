interface Props {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className={`mb-6${action ? ' flex items-center justify-between' : ''}`}>
      <div>
        <h1 className="text-2xl font-bold text-[#1d3557]">{title}</h1>
        {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
