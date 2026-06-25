import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <Sidebar />
      <main className="ml-48 pt-14 p-8">
        {children}
      </main>
    </div>
  )
}import Link from 'next/link'

const cards = [
  { icon: '📅', title: 'Sacar Turno',      desc: 'Pedí turno con tu médico de cabecera o especialista',  href: '/login' },
  { icon: '🩺', title: 'Especialidades',   desc: 'Clínica Médica, Cardiología, Pediatría, Traumatología y más', href: '/login' },
  { icon: '📄', title: 'Mis Estudios',     desc: 'Accedé a tus resultados de laboratorio e imágenes',    href: '/login' },
  { icon: '📞', title: 'Contacto',         desc: 'Guardia: (0298) 444-0000 · Turnos: (0298) 444-0001',   href: '#contacto' },
  { icon: '🚑', title: 'Emergencias',      desc: 'Emergencias médicas: 107 · Defensa Civil: 103',        href: '#contacto' },
  { icon: 'ℹ️', title: 'Información',      desc: 'Horarios de atención, ubicación y servicios del hospital', href: '#contacto' },
]

