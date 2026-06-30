import { NextResponse, type NextRequest } from 'next/server'

function decodeToken(token: string): { role?: string } | null {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
  } catch {
    return null
  }
}

function roleHome(role: string): string {
  if (role === 'ADMIN')  return '/admin/appointments'
  if (role === 'DOCTOR') return '/doctor/appointments'
  return '/appointments'
}

// Qué roles pueden acceder a cada prefijo de ruta
const ROUTE_ROLES: { prefix: string; allowed: string[] }[] = [
  { prefix: '/admin',        allowed: ['ADMIN'] },
  { prefix: '/doctor',       allowed: ['DOCTOR'] },
  { prefix: '/appointments', allowed: ['PATIENT'] },
  { prefix: '/studies',      allowed: ['PATIENT'] },
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('turnosalud_token')?.value

  const isPublic = pathname === '/' || pathname.startsWith('/login') || pathname.startsWith('/register')

  if (isPublic) {
    // Si ya tiene sesión, redirigir a su home
    if (token) {
      const payload = decodeToken(token)
      if (payload?.role) {
        return NextResponse.redirect(new URL(roleHome(payload.role), request.url))
      }
    }
    return NextResponse.next()
  }

  // Ruta protegida — necesita token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = decodeToken(token)
  if (!payload?.role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const { role } = payload

  // Verificar que el rol tenga acceso al prefijo que intenta visitar
  for (const { prefix, allowed } of ROUTE_ROLES) {
    if (pathname.startsWith(prefix) && !allowed.includes(role)) {
      return NextResponse.redirect(new URL(roleHome(role), request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.webp$).*)'],
}
