'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { saveToken } from '@/lib/auth'
import { loginSchema } from '@/lib/schemas'
import { Role } from '@/types'
import { AuthCard } from '@/components/ui/AuthCard'
import { FormInput } from '@/components/ui/FormInput'
import { Alert } from '@/components/ui/Alert'

type Tab = 'Paciente' | 'Médico' | 'Admin'

const roleMap: Record<Tab, Role> = {
  'Paciente': 'PATIENT',
  'Médico':   'DOCTOR',
  'Admin':    'ADMIN',
}

const redirectMap: Record<Role, string> = {
  PATIENT: '/appointments',
  DOCTOR:  '/doctor/appointments',
  ADMIN:   '/admin/availability',
}

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ dni: '', password: '' })
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

    const result = loginSchema.safeParse(form)
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
      const res = await api.auth.login(result.data)

      saveToken(res.token)
      router.push(redirectMap[res.role as Role])
    } catch (err: any) {
      setGlobalError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard title="Iniciar sesión" subtitle="Ingresá con tu DNI y contraseña" cardClassName="h-[31rem]">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {[
          { name: 'dni',      label: 'DNI',        placeholder: '38123456', type: 'number'   },
          { name: 'password', label: 'Contraseña', placeholder: '••••••••', type: 'password', showToggle: true },
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
          className="w-full bg-[#2a9d8f] hover:bg-[#238a7e] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60 cursor-pointer"
        >
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </button>
      </form>

      
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="text-[#2a9d8f] font-medium hover:underline">
            Registrate
          </Link>
        </p>
    
    </AuthCard>
  )
}
