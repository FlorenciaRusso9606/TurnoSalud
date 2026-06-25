import Link from 'next/link'

const cards = [
  { icon: '📅', title: 'Sacar Turno',      desc: 'Pedí turno con tu médico de cabecera o especialista',  href: '/login' },
  { icon: '🩺', title: 'Especialidades',   desc: 'Clínica Médica, Cardiología, Pediatría, Traumatología y más', href: '/login' },
  { icon: '📄', title: 'Mis Estudios',     desc: 'Accedé a tus resultados de laboratorio e imágenes',    href: '/login' },
  { icon: '📞', title: 'Contacto',         desc: 'Guardia: (0298) 444-0000 · Turnos: (0298) 444-0001',   href: '#contacto' },
  { icon: '🚑', title: 'Emergencias',      desc: 'Emergencias médicas: 107 · Defensa Civil: 103',        href: '#contacto' },
  { icon: 'ℹ️', title: 'Información',      desc: 'Horarios de atención, ubicación y servicios del hospital', href: '#contacto' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar pública */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2a9d8f] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">+</span>
            </div>
            <span className="font-bold text-[#1d3557] text-lg">TurnoSalud</span>
          </div>
          <Link
            href="/login"
            className="bg-[#2a9d8f] hover:bg-[#238a7e] text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Ingresar
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section
        className="relative h-[70vh] flex items-center justify-center bg-cover bg-center pt-16"
        style={{ backgroundImage: "linear-gradient(to bottom, rgba(29,53,87,0.65), rgba(29,53,87,0.80)), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1600')" }}
      >
        <div className="text-center text-white px-4">
          <p className="text-sm font-medium tracking-widest uppercase text-[#a8dadc] mb-3">
            Hospital Público · Patagonia Argentina
          </p>
          <h1 className="text-5xl font-bold mb-4">TurnoSalud</h1>
          <p className="text-xl text-gray-200 mb-8 max-w-xl mx-auto">
            Gestioná tus turnos médicos y accedé a tus estudios desde cualquier lugar
          </p>
          <Link
            href="/login"
            className="bg-[#2a9d8f] hover:bg-[#238a7e] text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors inline-block"
          >
            Sacar turno
          </Link>
        </div>
      </section>

      {/* Cards */}
      <section className="bg-[#f8fafc] py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map(card => (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#2a9d8f] hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3 className="font-semibold text-[#1d3557] text-lg mb-1 group-hover:text-[#2a9d8f] transition-colors">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500">{card.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer / Contacto */}
      <footer id="contacto" className="bg-[#2a9d8f] text-white py-12 px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">+</span>
              </div>
              <span className="font-bold text-xl">TurnoSalud</span>
            </div>
            <p className="text-white/80 text-sm">
              Sistema de gestión de turnos del Hospital Público de la Patagonia.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Información de contacto</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>📍 General Roca, Río Negro, Argentina</li>
              <li>📞 Turnos: (0298) 444-0001</li>
              <li>🚑 Guardia: (0298) 444-0000</li>
              <li>✉️ contacto@turnosalud.gob.ar</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Teléfonos útiles</h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li>Emergencias <strong>107</strong></li>
              <li>Defensa Civil <strong>103</strong></li>
              <li>Maltrato Infantil <strong>102</strong></li>
              <li>Víctimas de violencia <strong>148</strong></li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-white/20 text-center text-sm text-white/60">
          © {new Date().getFullYear()} TurnoSalud · Ministerio de Salud · Provincia del Neuquén
        </div>
      </footer>
    </div>
  )
}