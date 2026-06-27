'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, FileText, ClipboardList, MessageSquarePlus, Phone, Mail, MapPin } from 'lucide-react'
import { api } from '@/lib/api'
import { PatientRecord, MedicalNote } from '@/types'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { formatDate, formatShortDate } from '@/lib/dateUtils'

const STUDIES_PREVIEW = 4

async function openStudy(studyId: string) {
  const { url } = await api.studies.getDownloadUrl(studyId)
  window.open(url, '_blank')
}

function NoteCard({ note }: { note: MedicalNote }) {
  const date = new Date(note.createdAt).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const time = new Date(note.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="px-6 py-4 border-b border-gray-50 last:border-0">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-medium text-[#2a9d8f]">
          Dr. {note.doctorLastname}, {note.doctorName}
        </span>
        <span className="text-xs text-gray-400">{date} · {time} hs</span>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note.content}</p>
    </div>
  )
}

export default function PatientRecordPage() {
  const params = useParams()
  const router = useRouter()
  const dni    = Number(params.dni)

  const [record, setRecord]     = useState<PatientRecord | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteContent, setNoteContent]   = useState('')
  const [savingNote, setSavingNote]     = useState(false)
  const [noteError, setNoteError]       = useState('')

  useEffect(() => {
    if (!dni) return
    api.patients.getRecord(dni)
      .then(setRecord)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [dni])

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return
    setSavingNote(true)
    setNoteError('')
    try {
      const note = await api.medicalNotes.create({ patientDni: dni, content: noteContent.trim() })
      setRecord(r => r ? { ...r, notes: [note, ...r.notes], summary: { ...r.summary, totalNotes: r.summary.totalNotes + 1 } } : r)
      setNoteContent('')
      setShowNoteForm(false)
    } catch (err: any) {
      setNoteError(err.message)
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) return <p className="text-gray-400 text-sm p-8">Cargando ficha...</p>

  if (notFound || !record) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Paciente no encontrado</p>
        <Button variant="ghost" onClick={() => router.back()} className="text-sm text-[#2a9d8f]">
          Volver
        </Button>
      </div>
    )
  }

  const { patient, notes, summary, studies, nextAppointment, history } = record
  const now = new Date()
  const age = Math.floor((now.getTime() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 3600 * 1000))
  const birthDateFmt = new Date(patient.birthDate).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  const previewStudies = studies.slice(0, STUDIES_PREVIEW)
  const hasMoreStudies = studies.length > STUDIES_PREVIEW

  return (
    <div className="max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-5"
      >
        <ArrowLeft size={15} />
        Volver
      </Button>

      {/* ── 1. Encabezado del paciente ── */}
      <div className="bg-white rounded-2xl border border-gray-100 px-6 py-5 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#2a9d8f] text-white text-lg font-bold">
            {patient.name[0]}{patient.lastname[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-[#1d3557]">{patient.lastname}, {patient.name}</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              DNI: {patient.dni}
              {patient.socialWork && <span className="ml-2 font-medium text-[#2a9d8f]">{patient.socialWork}</span>}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              Fecha de nacimiento: {birthDateFmt} · {age} años
            </p>
            {(patient.phone || patient.email || patient.address) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {patient.phone && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Phone size={11} className="text-[#2a9d8f]" />{patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Mail size={11} className="text-[#2a9d8f]" />{patient.email}
                  </span>
                )}
                {patient.address && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin size={11} className="text-[#2a9d8f]" />{patient.address}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Resumen clínico ── */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-4">
        <div className="flex items-center gap-2 px-6 py-3.5 border-b border-gray-50">
          <ClipboardList size={15} className="text-[#2a9d8f]" />
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Resumen clínico</h2>
        </div>
        <div className="grid grid-cols-2 divide-x divide-gray-50">
          <div className="px-6 py-4">
            <p className="text-xs text-gray-400 mb-1">Último estudio</p>
            {summary.lastStudy ? (
              <>
                <p className="text-sm font-semibold text-[#1d3557] leading-tight">{summary.lastStudy.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatShortDate(summary.lastStudy.performedAt)}</p>
              </>
            ) : <p className="text-sm text-gray-300">—</p>}
          </div>
          <div className="px-6 py-4">
            <p className="text-xs text-gray-400 mb-1">Próximo turno</p>
            {summary.nextAppointment ? (
              <>
                <p className="text-sm font-semibold text-[#1d3557] leading-tight">
                  {formatShortDate(summary.nextAppointment.scheduledAt)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(summary.nextAppointment.scheduledAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                  {summary.nextAppointment.specialtyName && ` · ${summary.nextAppointment.specialtyName}`}
                </p>
              </>
            ) : <p className="text-sm text-gray-300">Sin turno próximo</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-50 border-t border-gray-50">
          <div className="px-6 py-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2a9d8f]">{summary.totalStudies}</span>
            <span className="text-xs text-gray-400">estudios</span>
          </div>
          <div className="px-6 py-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2a9d8f]">{summary.totalAppointments}</span>
            <span className="text-xs text-gray-400">turnos</span>
          </div>
          <div className="px-6 py-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[#2a9d8f]">{summary.totalNotes}</span>
            <span className="text-xs text-gray-400">notas</span>
          </div>
        </div>
      </div>

      {/* ── 3. Notas médicas ── */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-4">
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <MessageSquarePlus size={15} className="text-[#2a9d8f]" />
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Notas clínicas ({notes.length})
            </h2>
          </div>
          {!showNoteForm && (
            <Button
              variant="ghost"
              onClick={() => setShowNoteForm(true)}
              className="text-xs text-[#2a9d8f] font-medium"
            >
              + Nueva nota
            </Button>
          )}
        </div>

        {showNoteForm && (
          <div className="px-6 py-4 border-b border-gray-50 bg-[#f8fdfc]">
            {noteError && <div className="mb-3"><Alert>{noteError}</Alert></div>}
            <textarea
              autoFocus
              value={noteContent}
              onChange={e => setNoteContent(e.target.value)}
              rows={4}
              placeholder="Escribir observación clínica..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2a9d8f] resize-none"
            />
            <div className="flex gap-2 mt-2">
              <Button
                onClick={handleSaveNote}
                disabled={!noteContent.trim()}
                loading={savingNote}
                loadingText="Guardando..."
                className="text-sm px-4 py-1.5"
              >
                Guardar nota
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setShowNoteForm(false); setNoteContent(''); setNoteError('') }}
                className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !showNoteForm ? (
          <p className="text-sm text-gray-400 px-6 py-4">Sin notas clínicas registradas</p>
        ) : (
          notes.map(n => <NoteCard key={n.id} note={n} />)
        )}
      </div>

      {/* ── 4. Estudios recientes ── */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-4">
        <div className="flex items-center gap-2 px-6 py-3.5 border-b border-gray-50">
          <FileText size={15} className="text-[#2a9d8f]" />
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Estudios recientes</h2>
        </div>

        {studies.length === 0 ? (
          <p className="text-sm text-gray-400 px-6 py-4">Sin estudios cargados</p>
        ) : (
          <>
            <div className="divide-y divide-gray-50">
              {previewStudies.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d3557] truncate">{s.title}</p>
                    <p className="text-xs text-gray-400">{s.institution} · {formatShortDate(s.performedAt)}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => openStudy(s.id)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 shrink-0"
                  >
                    <Download size={11} />
                    Ver PDF
                  </Button>
                </div>
              ))}
            </div>
            {hasMoreStudies && (
              <div className="px-6 py-3 border-t border-gray-50">
                <Link href={`/doctor/patients/${dni}/studies`}
                  className="text-sm text-[#2a9d8f] hover:underline font-medium">
                  Ver todos los estudios ({studies.length}) →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── 5. Próximo turno ── */}
      <div className="bg-white rounded-2xl border border-gray-100 mb-4">
        <div className="flex items-center gap-2 px-6 py-3.5 border-b border-gray-50">
          <span className="text-[#2a9d8f]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Próximo turno</h2>
        </div>

        {nextAppointment ? (() => {
          const { day, month, time } = formatDate(nextAppointment.scheduledAt)
          return (
            <div className="px-6 py-4 flex items-center gap-4">
              <div className="w-14 text-center bg-[#e6f5f3] rounded-xl py-2.5 shrink-0">
                <p className="text-xl font-bold text-[#2a9d8f] leading-none">{day}</p>
                <p className="text-xs text-[#2a9d8f]/70 uppercase font-medium">{month}</p>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#1d3557]">
                  {time}{nextAppointment.specialtyName && ` · ${nextAppointment.specialtyName}`}
                </p>
              </div>
              <StatusBadge status={nextAppointment.status} />
            </div>
          )
        })() : (
          <p className="text-sm text-gray-400 px-6 py-4">Sin turnos próximos agendados</p>
        )}
      </div>

      {/* ── 6. Historial de turnos ── */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center gap-2 px-6 py-3.5 border-b border-gray-50">
            <span className="text-[#2a9d8f]">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3h18"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M3 21h18"/>
              </svg>
            </span>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Historial de turnos ({history.length})
            </h2>
          </div>
          <div className="divide-y divide-gray-50">
            {history.map(a => {
              const { day, month, time } = formatDate(a.scheduledAt)
              return (
                <div key={a.id} className="flex items-center gap-3 px-6 py-3">
                  <div className="w-10 text-center shrink-0">
                    <p className="text-sm font-semibold text-gray-500 leading-none">{day}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{month}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">
                      {time}{a.specialtyName && <span className="font-medium"> · {a.specialtyName}</span>}
                    </p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
