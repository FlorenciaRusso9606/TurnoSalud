import { getToken } from './auth'
import { Appointment, Study, StudyType, Doctor, DoctorDetail, Patient } from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 204) return undefined as T

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? 'Error del servidor')
  }

  return data
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export const api = {
  auth: {
    login: (body: { dni: number; password: string }) =>
      request<{ token: string; role: string; dni: number }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(body),
      }),

    register: (body: {
      dni: number
      password: string
      name: string
      lastname: string
      socialWork?: string
    }) =>
      request<{ id: number; dni: number; role: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  // ─── Appointments ──────────────────────────────────────────────────────────

  appointments: {
    getAvailable: (specialtyId: number, date: string) =>
      request<AvailableSlot[]>(
        `/appointments/available?specialtyId=${specialtyId}&date=${date}`
      ),

    getMine: () => request<Appointment[]>('/appointments/mine'),

    getDoctor: (range: 'today' | 'week' | 'month') =>
      request<Appointment[]>(`/appointments/doctor?range=${range}`),

    book: (body: { doctorLicense: number; specialtyId: number; scheduledAt: string }) =>
      request('/appointments', { method: 'POST', body: JSON.stringify(body) }),

    cancel: (id: number) =>
      request(`/appointments/${id}/cancel`, { method: 'PATCH' }),

    changeStatus: (id: number, status: string) =>
      request(`/appointments/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },

  // ─── Studies ───────────────────────────────────────────────────────────────

  studies: {
    getMine: () => request<Study[]>('/studies/mine'),

    getByPatient: (dni: number) => request<Study[]>(`/studies/patient/${dni}`),

    upload: async (formData: FormData) => {
      const token = getToken()
      const res = await fetch(`${BASE_URL}/studies`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error del servidor')
      return data as Study
    },
  },

  // ─── Study types ───────────────────────────────────────────────────────────

  studyTypes: {
    getAll: () => request<StudyType[]>('/study-types'),
  },

  // ─── Specialties ───────────────────────────────────────────────────────────

  specialties: {
    getAll: () => request<{ id: number; name: string }[]>('/specialties'),
  },

  // ─── Doctors ───────────────────────────────────────────────────────────────

  doctors: {
    getBySpecialty: (specialtyId: number) =>
      request<Doctor[]>(`/doctors?specialtyId=${specialtyId}`),

    getByLicense: (licenseNumber: number) =>
      request<DoctorDetail>(`/doctors/${licenseNumber}`),

    search: (q: string) =>
      request<DoctorDetail[]>(`/doctors/search?q=${encodeURIComponent(q)}`),
  },

  // ─── Patients ──────────────────────────────────────────────────────────────

  patients: {
    getAll: () => request<Patient[]>('/patients'),
    search: (q: string) => request<Patient[]>(`/patients/search?q=${encodeURIComponent(q)}`),
  },

  // ─── Availability ──────────────────────────────────────────────────────────

  availability: {
    getByDoctor: (licenseNumber: number) =>
      request<import('@/types').DoctorAvailability[]>(`/availability?licenseNumber=${licenseNumber}`),

    create: (body: {
      licenseNumber: number
      date: string
      startTime: string
      endTime: string
      intervalMinutes?: number
    }) => request('/availability', { method: 'POST', body: JSON.stringify(body) }),

    update: (id: number, body: { startTime: string; endTime: string; intervalMinutes?: number }) =>
      request(`/availability/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

    delete: (id: number) => request(`/availability/${id}`, { method: 'DELETE' }),
  },
}
