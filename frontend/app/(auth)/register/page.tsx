'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { registerSchema } from '@/lib/schemas'
import { AuthCard } from '@/components/ui/AuthCard'
import { FormInput } from '@/components/ui/FormInput'
import { Alert } from '@/components/ui/Alert'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    dni: '', name: '', lastname: '', birthDate: '', socialWork: '', password: '', confirm: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setGlobalError('')

    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        const field = String(issue.path[0])
        if (!fieldErrors[field]) fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    try {
      const { confirm: _, ...fields } = result.data
      await api.auth.register({
        ...fields,
        socialWork: fields.socialWork || undefined,
      })
      router.push('/login')
    } catch (err: any) {
      setGlobalError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Crear cuenta" subtitle="Completá tus datos para registrarte" cardClassName="h-[52rem]">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {[
          { name: 'name',       label: 'Nombre',                 placeholder: 'Juan',     type: 'text'     },
          { name: 'lastname',   label: 'Apellido',               placeholder: 'Pérez',    type: 'text'     },
          { name: 'dni',        label: 'DNI',                    placeholder: '38123456', type: 'number'   },
          { name: 'birthDate',  label: 'Fecha de nacimiento',    placeholder: '',         type: 'date', min: '1920-01-01', max: new Date().toISOString().split('T')[0] },
          { name: 'socialWork', label: 'Obra Social (opcional)', placeholder: 'OSDE',     type: 'text'     },
          { name: 'password',   label: 'Contraseña',             placeholder: '••••••••', type: 'password', showToggle: true },
          { name: 'confirm',    label: 'Repetir contraseña',     placeholder: '••••••••', type: 'password', showToggle: true },
        ].map(({ name, label, ...rest }) => (
          <FormInput
            key={name}
            label={label}
            name={name}
            value={form[name as keyof typeof form]}
            onChange={handleChange}
            error={errors[name]}
            {...rest}
          />
        ))}

        {globalError && <Alert>{globalError}</Alert>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#2a9d8f] hover:bg-[#238a7e] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
        >
          {loading ? 'Registrando...' : 'Crear cuenta'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="text-[#2a9d8f] font-medium hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </AuthCard>
  )
}
