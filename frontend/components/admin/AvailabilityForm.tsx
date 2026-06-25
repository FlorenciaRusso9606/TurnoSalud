'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { availabilitySchema } from '@/lib/schemas'
import { FormInput } from '@/components/ui/FormInput'
import { FormSelect } from '@/components/ui/FormSelect'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'

interface DefaultValues {
  date: string
  startTime: string
  endTime: string
  intervalMinutes: string
}

interface Props {
  licenseNumber: number
  onSuccess: () => void
  defaultDate?: string
  editId?: number
  defaultValues?: DefaultValues
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export function AvailabilityForm({ licenseNumber, onSuccess, defaultDate, editId, defaultValues }: Props) {
  const isEdit = !!editId

  const [form, setForm] = useState({
    licenseNumber: String(licenseNumber),
    date:            defaultValues?.date ?? defaultDate ?? '',
    startTime:       defaultValues?.startTime ?? '',
    endTime:         defaultValues?.endTime ?? '',
    intervalMinutes: defaultValues?.intervalMinutes ?? '30',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (isEdit) {
      if (!form.startTime || !form.endTime) {
        setError('Completá los horarios')
        return
      }
      if (form.startTime >= form.endTime) {
        setError('La hora de inicio debe ser anterior a la de fin')
        return
      }
      setLoading(true)
      try {
        await api.availability.update(editId!, {
          startTime: form.startTime,
          endTime: form.endTime,
          intervalMinutes: parseInt(form.intervalMinutes),
        })
        toast.success('Disponibilidad actualizada')
        onSuccess()
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
      return
    }

    const result = availabilitySchema.safeParse(form)
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    try {
      await api.availability.create(result.data)
      toast.success('Disponibilidad cargada correctamente')
      onSuccess()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {isEdit ? (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-0.5">Fecha</p>
          <p className="text-sm font-medium text-gray-800">{formatDateLabel(form.date)}</p>
        </div>
      ) : (
        <FormInput
          label="Fecha"
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
          min={new Date().toISOString().split('T')[0]}
        />
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Hora inicio"
          type="time"
          name="startTime"
          value={form.startTime}
          onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
        />
        <FormInput
          label="Hora fin"
          type="time"
          name="endTime"
          value={form.endTime}
          onChange={handleChange as React.ChangeEventHandler<HTMLInputElement>}
        />
      </div>

      <FormSelect
        label="Intervalo entre turnos"
        name="intervalMinutes"
        value={form.intervalMinutes}
        onChange={handleChange as React.ChangeEventHandler<HTMLSelectElement>}
      >
        <option value="15">15 minutos</option>
        <option value="20">20 minutos</option>
        <option value="30">30 minutos</option>
        <option value="45">45 minutos</option>
        <option value="60">1 hora</option>
      </FormSelect>

      {error && <Alert>{error}</Alert>}

      <Button type="submit" loading={loading} loadingText="Guardando..." className="w-full py-2.5">
        {isEdit ? 'Actualizar disponibilidad' : 'Guardar disponibilidad'}
      </Button>
    </form>
  )
}
