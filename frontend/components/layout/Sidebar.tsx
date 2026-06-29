'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CalendarDays, CalendarPlus, FileText, Clock, Users, CalendarRange,
  Upload, Stethoscope, BookOpen, UserCog, LayoutDashboard, CalendarCheck,
} from 'lucide-react'
import { getUserRole } from '@/lib/auth'

interface NavLink {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}

const patientLinks: NavLink[] = [
  { href: '/appointments',     label: 'Mis Turnos',   icon: CalendarDays, exact: true },
  { href: '/appointments/new', label: 'Sacar Turno',  icon: CalendarPlus },
  { href: '/studies',          label: 'Mis Estudios', icon: FileText     },
]

const doctorLinks: NavLink[] = [
  { href: '/doctor/appointments', label: 'Turnos de Hoy', icon: Clock  },
  { href: '/doctor/patients',     label: 'Pacientes',     icon: Users  },
]

const adminLinks: NavLink[] = [
  { href: '/admin/dashboard',    label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/admin/appointments', label: 'Turnos',         icon: CalendarCheck   },
  { href: '/admin/patients',     label: 'Pacientes',      icon: Users           },
  { href: '/admin/doctors',      label: 'Médicos',        icon: Stethoscope     },
  { href: '/admin/specialties',  label: 'Especialidades', icon: BookOpen        },
  { href: '/admin/users',        label: 'Usuarios',       icon: UserCog         },
  { href: '/admin/availability', label: 'Disponibilidad', icon: CalendarRange   },
  { href: '/admin/studies',      label: 'Cargar Estudio', icon: Upload          },
]

export function Sidebar() {
  const pathname = usePathname()
  const role = getUserRole()

  const links =
    role === 'DOCTOR' ? doctorLinks :
    role === 'ADMIN'  ? adminLinks  :
    patientLinks

  return (
    <aside className="fixed top-14 left-0 w-48 h-[calc(100vh-56px)] bg-white border-r border-gray-200 py-6 px-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
        Menú
      </p>
      <nav className="flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-[#e6f5f3] text-[#2a9d8f] font-medium'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
