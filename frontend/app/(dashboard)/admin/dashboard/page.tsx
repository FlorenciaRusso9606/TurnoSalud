'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { CalendarCheck, CalendarX, UserX, TrendingDown, Users } from 'lucide-react'
import { api } from '@/lib/api'
import { DashboardStats } from '@/types'
import { PageHeader } from '@/components/ui/PageHeader'

type Range = 'today' | 'week' | 'month'

const TABS: { label: string; value: Range }[] = [
  { label: 'Hoy',         value: 'today' },
  { label: 'Esta semana', value: 'week'  },
  { label: 'Este mes',    value: 'month' },
]

const STATUS_COLORS = {
  confirmed: '#2a9d8f',
  pending:   '#f4a261',
  absent:    '#e63946',
  cancelled: '#adb5bd',
}

interface KpiCardProps {
  icon: React.ElementType
  label: string
  value: string | number
  sub?: string
  color: string
}

function KpiCard({ icon: Icon, label, value, sub, color }: KpiCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#1d3557] leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  const [range, setRange]     = useState<Range>('today')
  const [stats, setStats]     = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.dashboard.getStats(range)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [range])

  return (
    <div className="max-w-5xl">
      <PageHeader title="Dashboard" subtitle="Métricas de actividad del hospital" />

      {/* Tabs */}
      <div className="flex rounded-lg bg-gray-100 p-1 mb-6 max-w-xs">
        {TABS.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setRange(t.value)}
            className={`flex-1 py-1.5 text-sm rounded-md transition-all cursor-pointer ${
              range === t.value
                ? 'shadow-sm font-medium text-white bg-[#2a9d8f]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-400 text-sm">Cargando estadísticas...</p>}

      {!loading && stats && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <KpiCard
              icon={Users}
              label="Turnos totales"
              value={stats.kpis.total}
              color="bg-[#1d3557]"
            />
            <KpiCard
              icon={CalendarCheck}
              label="Confirmados"
              value={stats.kpis.confirmed}
              color="bg-[#2a9d8f]"
            />
            <KpiCard
              icon={CalendarX}
              label="Cancelados"
              value={stats.kpis.cancelled}
              color="bg-gray-400"
            />
            <KpiCard
              icon={UserX}
              label="Ausentes"
              value={stats.kpis.absent}
              color="bg-red-400"
            />
            <KpiCard
              icon={TrendingDown}
              label="Tasa de ausentismo"
              value={`${stats.kpis.absenteeismRate}%`}
              sub="sobre turnos con resultado"
              color={stats.kpis.absenteeismRate >= 20 ? 'bg-red-500' : 'bg-orange-400'}
            />
          </div>

          {/* ── Gráfico demanda por especialidad ── */}
          {stats.bySpecialty.length > 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-5">
                Demanda por especialidad
              </h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.bySpecialty} margin={{ top: 0, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="specialtyName"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #f0f0f0', fontSize: 12 }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar dataKey="confirmed" name="Confirmados" stackId="a" fill={STATUS_COLORS.confirmed} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="pending"   name="Pendientes"  stackId="a" fill={STATUS_COLORS.pending}   />
                  <Bar dataKey="absent"    name="Ausentes"    stackId="a" fill={STATUS_COLORS.absent}    />
                  <Bar dataKey="cancelled" name="Cancelados"  stackId="a" fill={STATUS_COLORS.cancelled} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center mb-6">
              <p className="text-gray-400 text-sm">Sin turnos registrados para este período</p>
            </div>
          )}

          {/* ── Vista por médico ── */}
          {stats.byDoctor.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 mb-6">
              <div className="px-6 py-4 border-b border-gray-50">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  Vista por médico
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-50">
                      <th className="text-left px-6 py-3 font-medium">Médico</th>
                      <th className="text-left px-4 py-3 font-medium">Especialidad</th>
                      <th className="text-center px-4 py-3 font-medium">Total</th>
                      <th className="text-center px-4 py-3 font-medium">Confirmados</th>
                      <th className="text-center px-4 py-3 font-medium">Ausentes</th>
                      <th className="text-center px-4 py-3 font-medium">Cancelados</th>
                      <th className="text-center px-4 py-3 font-medium">Ausentismo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {stats.byDoctor.map(d => (
                      <tr key={d.licenseNumber} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-3 font-medium text-[#1d3557]">{d.doctorName}</td>
                        <td className="px-4 py-3 text-gray-500">{d.specialtyName}</td>
                        <td className="px-4 py-3 text-center font-semibold text-[#1d3557]">{d.total}</td>
                        <td className="px-4 py-3 text-center text-[#2a9d8f]">{d.confirmed}</td>
                        <td className="px-4 py-3 text-center text-red-500">{d.absent}</td>
                        <td className="px-4 py-3 text-center text-gray-400">{d.cancelled}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            d.absenteeismRate >= 30 ? 'bg-red-50 text-red-600'
                            : d.absenteeismRate >= 15 ? 'bg-orange-50 text-orange-500'
                            : 'bg-green-50 text-green-600'
                          }`}>
                            {d.absenteeismRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
