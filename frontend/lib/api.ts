import { getToken, removeToken } from './auth'
import {
  Appointment, AvailableSlot, Study, StudyType, Doctor, DoctorDetail, DoctorAdmin,
  Patient, PatientRecord, Specialty, UserAdmin, MedicalNote, DashboardStats,
} from '@/types'

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

  if (res.status === 401) {
    if (getToken()) {
      removeToken()
      window.location.href = '/login?expired=1'
    }
    const data = await res.json()
    throw new Error(data.error ?? 'No autorizado')
  }

  if (res.status === 403) {
    window.location.href = '/'
    throw new Error('Sin permisos')
  }

  if (res.status === 204) return undefined as T

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error ?? 'Error del servidor')
  }

  return data
}

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

    getByPatient: (dni: number) =>
      request<Appointment[]>(`/appointments/patient/${dni}`),
  },

  studies: {
    getMine: () => request<Study[]>('/studies/mine'),

    getByPatient: (dni: number) => request<Study[]>(`/studies/patient/${dni}`),

    getDownloadUrl: (studyId: string) =>
      request<{ url: string }>(`/studies/${studyId}/download`),

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

  studyTypes: {
    getAll: () => request<StudyType[]>('/study-types'),
  },

  specialties: {
    getAll: () => request<Specialty[]>('/specialties'),

    create: (body: { name: string }) =>
      request<Specialty>('/specialties', { method: 'POST', body: JSON.stringify(body) }),

    update: (id: number, body: { name: string }) =>
      request<Specialty>(`/specialties/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    delete: (id: number) =>
      request<void>(`/specialties/${id}`, { method: 'DELETE' }),
  },

  doctors: {
    getBySpecialty: (specialtyId: number) =>
      request<Doctor[]>(`/doctors?specialtyId=${specialtyId}`),

    getAll: () => request<DoctorAdmin[]>('/doctors/all'),

    getByLicense: (licenseNumber: number) =>
      request<DoctorDetail>(`/doctors/${licenseNumber}`),

    search: (q: string) =>
      request<DoctorDetail[]>(`/doctors/search?q=${encodeURIComponent(q)}`),

    create: (body: {
      dni: number; name: string; lastname: string
      licenseNumber: number; specialtyId: number; password: string
    }) => request<{ licenseNumber: number; name: string; lastname: string }>(
      '/doctors', { method: 'POST', body: JSON.stringify(body) }
    ),

    update: (licenseNumber: number, body: { specialtyId?: number }) =>
      request(`/doctors/${licenseNumber}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  patients: {
    getAll:    () => request<Patient[]>('/patients'),
    search:    (q: string) => request<Patient[]>(`/patients/search?q=${encodeURIComponent(q)}`),
    getByDni:  (dni: number) => request<Patient>(`/patients/${dni}`),
    getRecord: (dni: number) => request<PatientRecord>(`/patients/${dni}/record`),

    create: (body: {
      dni: number; name: string; lastname: string; birthDate: string; password: string
      socialWork?: string; email?: string; phone?: string; address?: string
    }) => request<{ dni: number; name: string; lastname: string }>(
      '/patients', { method: 'POST', body: JSON.stringify(body) }
    ),

    update: (dni: number, body: {
      socialWork?: string | null; email?: string | null; phone?: string | null; address?: string | null
    }) => request(`/patients/${dni}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

  medicalNotes: {
    create: (body: { patientDni: number; content: string }) =>
      request<MedicalNote>('/medical-notes', { method: 'POST', body: JSON.stringify(body) }),
  },

  users: {
    getAll: () => request<UserAdmin[]>('/users'),

    update: (id: number, body: {
      isActive?: boolean; email?: string | null; phone?: string | null
      address?: string | null; password?: string
    }) => request<UserAdmin>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  },

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

  dashboard: {
    getStats: (range: 'today' | 'week' | 'month') =>
      request<DashboardStats>(`/dashboard?range=${range}`),
  },
}
