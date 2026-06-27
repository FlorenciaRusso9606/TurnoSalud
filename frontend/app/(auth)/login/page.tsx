'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { saveToken } from '@/lib/auth'
import { loginSchema } from '@/lib/schemas'
import { Role } from '@/types'
import { AuthCard } from '@/components/ui/AuthCard'
import { FormInput } from '@/components/ui/FormInput'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

const redirectMap: Record<Role, string> = {
  PATIENT: '/appointments',
  DOCTOR:  '/doctor/appointments',
  ADMIN:   '/admin/availability',
}

export default function LoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const expired      = searchParams.get('expired') === '1'

  const [form, setForm] = useState({ dni: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors(prev => ({ ...prev, [e.target.name]: '' }))
  }

  async function handleSubmit(e: { preventDefault(): void }) {
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
    <AuthCard title="Iniciar sesión" subtitle="Ingresá con tu DNI y contraseña" cardClassName="h-auto">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {expired && (
          <Alert>Tu sesión caducó. Iniciá sesión nuevamente.</Alert>
        )}

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

        <Button type="submit" loading={loading} loadingText="Ingresando..." className="w-full py-2.5">
          Iniciar sesión
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-4">
        ¿No tenés cuenta?{' '}
        <Link href="/register" className="text-[#2a9d8f] font-medium hover:underline">
          Registrate
        </Link>
      </p>
      <p className="text-center text-sm text-gray-500 mt-2">
        <Link href="/" className="text-[#2a9d8f] font-medium hover:underline">
          ← Volver al inicio
        </Link>
      </p>
    </AuthCard>
  )
}
