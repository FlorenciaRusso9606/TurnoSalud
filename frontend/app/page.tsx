import Link from 'next/link'
import {
  Plus, Calendar, Stethoscope, FileText, Syringe,
  Droplets, Baby, HeartHandshake, Phone, MapPin, Mail,
  ShieldAlert, Clock,
} from 'lucide-react'

const services = [
  {
    icon: Calendar,
    title: 'Sacar Turno',
    desc: 'Pedí turno con tu médico de cabecera o especialista desde casa, sin filas.',
    href: '/login',
  },
  {
    icon: Stethoscope,
    title: 'Especialidades',
    desc: 'Clínica Médica, Cardiología, Pediatría, Traumatología, Ginecología y más.',
    href: '/login',
  },
  {
    icon: FileText,
    title: 'Mis Estudios',
    desc: 'Accedé a tus resultados de laboratorio e imágenes médicas en cualquier momento.',
    href: '/login',
  },
]

const campaigns = [
  {
    icon: Syringe,
    title: 'Campaña de Vacunación',
    desc: 'Vacuna antigripal gratuita para mayores de 65 años, embarazadas y personal de salud. No se requiere turno previo.',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    badge: 'Gratuita',
    badgeColor: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Droplets,
    title: 'Doná Sangre',
    desc: 'La donación es voluntaria, anónima y segura. Tu sangre puede salvar hasta 3 vidas. Podés donar cada 3 meses.',
    bg: 'bg-red-50',
    iconColor: 'text-red-500',
    badge: 'Todo el año',
    badgeColor: 'bg-red-100 text-red-600',
  },
  {
    icon: Baby,
    title: 'Control Pediátrico',
    desc: 'Controles de crecimiento y desarrollo para niños de 0 a 14 años. Atención sin costo con turno programado.',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-500',
    badge: 'Sin cargo',
    badgeColor: 'bg-orange-100 text-orange-600',
  },
  {
    icon: HeartHandshake,
    title: 'Salud Sexual y Reproductiva',
    desc: 'Atención, asesoramiento e insumos gratuitos. Consultá en el servicio de Ginecología y Obstetricia.',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-500',
    badge: 'Gratuita',
    badgeColor: 'bg-purple-100 text-purple-600',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2a9d8f] rounded-lg flex items-center justify-center">
              <Plus className="text-white" size={18} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-bold text-[#1d3557] text-base leading-none block">Hospital Cervantes</span>
              <span className="text-[10px] text-gray-400 leading-none">Río Negro · Argentina</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:02984440001"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#2a9d8f] transition-colors"
            >
              <Phone size={14} />
              (0298) 444-0001
            </a>
            <Link
              href="/login"
              className="bg-[#2a9d8f] hover:bg-[#238a7e] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      {/* Banner principal — foto real + info */}
      <section className="pt-16 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2" style={{ minHeight: '420px' }}>
          {/* Texto */}
          <div className="flex flex-col justify-center px-8 py-14 lg:py-20">
            <p className="text-[11px] font-semibold tracking-widest uppercase text-[#2a9d8f] mb-3">
              Ministerio de Salud · Provincia de Río Negro
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#1d3557] mb-4 leading-tight">
              Hospital Cervantes
            </h1>
            <p className="text-gray-500 text-base mb-8 leading-relaxed max-w-sm">
              Solicitá turnos, consultá tus estudios y accedé a los servicios del hospital desde la plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/login"
                className="bg-[#2a9d8f] hover:bg-[#238a7e] text-white px-7 py-2.5 rounded-xl font-semibold text-sm transition-colors text-center"
              >
                Sacar turno
              </Link>
              <a
                href="#campanas"
                className="border border-gray-200 hover:border-[#2a9d8f] text-gray-600 hover:text-[#2a9d8f] px-7 py-2.5 rounded-xl font-semibold text-sm transition-colors text-center"
              >
                Ver campañas
              </a>
            </div>
          </div>

          {/* Foto del hospital */}
          <div className="hidden lg:block relative overflow-hidden">
            <img
              src="/hospital-cervantes.webp"
              alt="Hospital Cervantes · Río Negro"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Franja emergencias — navy, discreta */}
        <div className="bg-[#1d3557] py-2.5 px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-center gap-6 text-white/80 text-sm flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <ShieldAlert size={14} />
              Emergencias:
            </span>
            <span>Guardia <strong className="text-white">(0298) 444-0000</strong></span>
            <span className="text-white/30">·</span>
            <span>SAME <strong className="text-white">107</strong></span>
            <span className="text-white/30">·</span>
            <span>Defensa Civil <strong className="text-white">103</strong></span>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="bg-[#f8fafc] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1d3557] mb-2 text-center">Servicios del hospital</h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Gestioná todo desde la plataforma, sin necesidad de acercarte al hospital
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc, href }) => (
              <Link
                key={title}
                href={href}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#2a9d8f] hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-[#e6f5f3] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#2a9d8f] transition-colors">
                  <Icon size={22} className="text-[#2a9d8f] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-semibold text-[#1d3557] text-base mb-1.5 group-hover:text-[#2a9d8f] transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Campañas */}
      <section id="campanas" className="bg-white py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1d3557] mb-2 text-center">Programas y campañas de salud</h2>
          <p className="text-gray-500 text-center text-sm mb-10">
            Iniciativas del Hospital Cervantes para la comunidad y la región
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {campaigns.map(({ icon: Icon, title, desc, bg, iconColor, badge, badgeColor }) => (
              <div key={title} className={`${bg} rounded-2xl p-5 flex flex-col gap-3`}>
                <div className="flex items-start justify-between">
                  <Icon size={24} className={iconColor} />
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                    {badge}
                  </span>
                </div>
                <h3 className="font-semibold text-[#1d3557] text-sm leading-snug">{title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed flex-1">{desc}</p>
                <Link
                  href="/login"
                  className="text-xs font-medium text-[#2a9d8f] hover:underline"
                >
                  Más información →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ubicación y contacto */}
      <section id="contacto" className="bg-[#f8fafc] py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-[#1d3557] mb-10 text-center">Dónde encontrarnos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

            {/* Mapa */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm h-80">
              <iframe
                src="https://maps.google.com/maps?q=Cervantes+Río+Negro+Argentina&output=embed&hl=es&z=14"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Hospital Cervantes"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#1d3557] mb-4">Hospital Cervantes · Río Negro</h3>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-3">
                    <MapPin size={16} className="text-[#2a9d8f] mt-0.5 shrink-0" />
                    <span>Cervantes, Río Negro, Argentina</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Phone size={16} className="text-[#2a9d8f] shrink-0" />
                    <div>
                      <p>Turnos: <strong>(0298) 444-0001</strong></p>
                      <p>Guardia: <strong>(0298) 444-0000</strong></p>
                    </div>
                  </li>
                  <li className="flex items-center gap-3">
                    <Mail size={16} className="text-[#2a9d8f] shrink-0" />
                    <span>contacto@hospitalcervantes.gob.ar</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock size={16} className="text-[#2a9d8f] mt-0.5 shrink-0" />
                    <div>
                      <p><strong>Consultorios externos:</strong> Lun – Vie, 7:00 – 19:00 hs</p>
                      <p><strong>Guardia:</strong> Las 24 horas, los 365 días</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h3 className="font-semibold text-[#1d3557] mb-4">Teléfonos de emergencia</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'SAME',               number: '107' },
                    { label: 'Defensa Civil',       number: '103' },
                    { label: 'Maltrato Infantil',   number: '102' },
                    { label: 'Violencia de Género', number: '148' },
                  ].map(({ label, number }) => (
                    <div key={label} className="bg-[#f8fafc] rounded-xl px-3 py-2.5 text-sm">
                      <span className="text-gray-500 block text-xs">{label}</span>
                      <strong className="text-[#1d3557] text-base">{number}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1d3557] text-white py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <Plus size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold">Hospital Cervantes</span>
          </div>
          <p className="text-xs text-white/50 text-center">
            © {new Date().getFullYear()} Hospital Cervantes · Ministerio de Salud · Provincia de Río Negro
          </p>
          <div className="flex gap-4 text-xs text-white/50">
            <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
            <Link href="/register" className="hover:text-white transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
