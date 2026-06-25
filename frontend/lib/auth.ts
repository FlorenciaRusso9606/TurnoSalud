import Cookies from 'js-cookie'
import { Role } from '@/types'

const TOKEN_KEY = 'turnosalud_token'

export function saveToken(token: string) {
  Cookies.set(TOKEN_KEY, token, { expires: 1 }) // 1 día
}

export function getToken(): string | undefined {
  return Cookies.get(TOKEN_KEY)
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY)
}

export function getTokenPayload(): { userId: number; dni: number; role: Role; name: string; lastname: string; licenseNumber?: number | null } | null {
  const token = getToken()
  if (!token) return null

  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload))
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!getToken()
}

export function getUserRole(): Role | null {
  return getTokenPayload()?.role ?? null
}

export function logout() {
  removeToken()
  window.location.href = '/login'
}