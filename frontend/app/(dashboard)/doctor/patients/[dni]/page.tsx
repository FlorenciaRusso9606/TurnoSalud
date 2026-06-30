"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquarePlus,
  Pencil,
  X,
  Check,
} from "lucide-react";
import { api } from "@/lib/api";
import { PatientRecord, MedicalNote } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { formatDate, formatShortDate } from "@/lib/dateUtils";

const STUDIES_PREVIEW = 4;

async function openStudy(studyId: string) {
  try {
    const { url } = await api.studies.getDownloadUrl(studyId);
    window.open(url, "_blank");
  } catch (e: any) {
    alert(e.message);
  }
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-800">
        {value || <span className="text-gray-300">-</span>}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200">
      <h2 className="text-xs font-semibold text-[#1d3557] uppercase tracking-wide">
        {title}
      </h2>
      {action}
    </div>
  );
}

function NoteCard({ note }: { note: MedicalNote }) {
  const date = new Date(note.createdAt).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = new Date(note.createdAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="px-5 py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold text-[#1d3557]">
          Dr. {note.doctorLastname}, {note.doctorName}
        </span>
        <span className="text-xs text-gray-400">
          {date} - {time} hs
        </span>
      </div>
      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
        {note.content}
      </p>
    </div>
  );
}

export default function PatientRecordPage() {
  const params = useParams();
  const router = useRouter();
  const dni = Number(params.dni);

  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editSW, setEditSW] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  useEffect(() => {
    if (!dni) return;
    api.patients
      .getRecord(dni)
      .then(setRecord)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [dni]);

  function startEdit() {
    if (!record) return;
    setEditPhone(record.patient.phone ?? "");
    setEditSW(record.patient.socialWork ?? "");
    setEditError("");
    setEditMode(true);
  }

  function cancelEdit() {
    setEditMode(false);
    setEditError("");
  }

  async function saveEdit() {
    if (!record) return;
    setSavingEdit(true);
    setEditError("");
    try {
      await api.patients.update(dni, {
        phone: editPhone.trim() || null,
        socialWork: editSW.trim() || null,
      });
      setRecord((r) =>
        r
          ? {
              ...r,
              patient: {
                ...r.patient,
                phone: editPhone.trim() || null,
                socialWork: editSW.trim() || null,
              },
            }
          : r,
      );
      setEditMode(false);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setSavingEdit(false);
    }
  }

  const handleSaveNote = async () => {
    if (!noteContent.trim()) return;
    setSavingNote(true);
    setNoteError("");
    try {
      const note = await api.medicalNotes.create({
        patientDni: dni,
        content: noteContent.trim(),
      });
      setRecord((r) =>
        r
          ? {
              ...r,
              notes: [note, ...r.notes],
              summary: { ...r.summary, totalNotes: r.summary.totalNotes + 1 },
            }
          : r,
      );
      setNoteContent("");
      setShowNoteForm(false);
    } catch (err: any) {
      setNoteError(err.message);
    } finally {
      setSavingNote(false);
    }
  };

  if (loading)
    return <p className="text-gray-400 text-sm p-8">Cargando ficha...</p>;

  if (notFound || !record) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">Paciente no encontrado</p>
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-sm text-[#2a9d8f]"
        >
          Volver
        </Button>
      </div>
    );
  }

  const { patient, notes, summary, studies, nextAppointment, history } = record;
  const now = new Date();
  const age = Math.floor(
    (now.getTime() - new Date(patient.birthDate).getTime()) /
      (365.25 * 24 * 3600 * 1000),
  );
  const birthDateFmt = new Date(patient.birthDate).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const previewStudies = studies.slice(0, STUDIES_PREVIEW);
  const hasMoreStudies = studies.length > STUDIES_PREVIEW;

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

      {/* Identificación del paciente */}
      <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <div className="bg-[#1d3557] px-5 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-white tracking-widest uppercase">
            Ficha del Paciente
          </span>
          <span className="text-[11px] text-white/50">
            Hospital Cervantes · Río Negro
          </span>
        </div>

        <div className="px-5 py-5">
          <div className="flex items-start justify-between border-b border-gray-100 pb-3 mb-4">
            <h1 className="text-lg font-bold text-[#1d3557]">
              {patient.lastname.toUpperCase()}, {patient.name}
            </h1>
            {!editMode ? (
              <Button
                variant="ghost"
                onClick={startEdit}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-[#2a9d8f]"
              >
                <Pencil size={12} />
                Editar
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                {editError && (
                  <span className="text-xs text-red-500">{editError}</span>
                )}
                <Button
                  variant="ghost"
                  onClick={cancelEdit}
                  className="flex items-center gap-1 text-xs"
                >
                  <X size={13} />
                  Cancelar
                </Button>
                <Button
                  variant="ghost"
                  onClick={saveEdit}
                  loading={savingEdit}
                  loadingText="Guardando…"
                  className="flex items-center gap-1 text-xs font-semibold text-[#2a9d8f] hover:text-[#238a7e]"
                >
                  <Check size={13} />
                  Guardar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <Field label="DNI" value={patient.dni.toString()} />
            <Field
              label="Fecha de nacimiento"
              value={`${birthDateFmt} (${age} años)`}
            />

            {/* Obra social - editable */}
            {editMode ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                  Obra social
                </p>
                <input
                  type="text"
                  value={editSW}
                  onChange={(e) => setEditSW(e.target.value)}
                  placeholder="Sin obra social"
                  className="w-full border border-[#2a9d8f] rounded px-2 py-1 text-sm focus:outline-none"
                />
              </div>
            ) : (
              <Field label="Obra social" value={patient.socialWork} />
            )}

            {/* Teléfono - editable */}
            {editMode ? (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">
                  Teléfono
                </p>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Sin teléfono"
                  className="w-full border border-[#2a9d8f] rounded px-2 py-1 text-sm focus:outline-none"
                />
              </div>
            ) : (
              <Field label="Teléfono" value={patient.phone} />
            )}

            <Field label="Dirección" value={patient.address} />
            <Field label="Correo electrónico" value={patient.email} />
          </div>
        </div>
      </div>

      {/* Próximo turno */}
      <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <SectionHeader title="Próximo turno" />
        {nextAppointment ? (
          (() => {
            const { day, month, time } = formatDate(
              nextAppointment.scheduledAt,
            );
            return (
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="w-14 text-center bg-[#e6f5f3] rounded-lg py-2.5 shrink-0">
                  <p className="text-xl font-bold text-[#2a9d8f] leading-none">
                    {day}
                  </p>
                  <p className="text-[10px] text-[#2a9d8f]/70 uppercase font-semibold mt-0.5">
                    {month}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#1d3557]">
                    {time} hs
                  </p>
                  {nextAppointment.specialtyName && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {nextAppointment.specialtyName}
                    </p>
                  )}
                </div>
                <StatusBadge status={nextAppointment.status} />
              </div>
            );
          })()
        ) : (
          <p className="text-sm text-gray-400 px-5 py-4">
            Sin turnos próximos agendados
          </p>
        )}
      </div>

      {/* Notas clínicas */}
      <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <SectionHeader
          title={`Notas clínicas${notes.length > 0 ? ` (${notes.length})` : ""}`}
          action={
            !showNoteForm ? (
              <Button
                variant="ghost"
                onClick={() => setShowNoteForm(true)}
                className="flex items-center gap-1 text-xs text-[#2a9d8f] font-semibold hover:underline"
              >
                <MessageSquarePlus size={13} />
                Nueva nota
              </Button>
            ) : undefined
          }
        />

        {showNoteForm && (
          <div className="px-5 py-4 border-b border-gray-100 bg-[#f8fdfc]">
            {noteError && (
              <div className="mb-3">
                <Alert>{noteError}</Alert>
              </div>
            )}
            <textarea
              autoFocus
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={4}
              placeholder="Escribir observación clínica..."
              className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#2a9d8f] resize-none"
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
                onClick={() => {
                  setShowNoteForm(false);
                  setNoteContent("");
                  setNoteError("");
                }}
                className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {notes.length === 0 && !showNoteForm ? (
          <p className="text-sm text-gray-400 px-5 py-4">
            Sin notas clínicas registradas
          </p>
        ) : (
          notes.map((n) => <NoteCard key={n.id} note={n} />)
        )}
      </div>

      {/* Estudios clínicos */}
      <div className="bg-white border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <SectionHeader
          title={`Estudios clínicos${studies.length > 0 ? ` (${studies.length})` : ""}`}
        />

        {studies.length === 0 ? (
          <p className="text-sm text-gray-400 px-5 py-4">
            Sin estudios cargados
          </p>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {previewStudies.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 bg-orange-50 rounded flex items-center justify-center shrink-0">
                    <FileText size={14} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1d3557] truncate">
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {s.institution} · {formatShortDate(s.performedAt)}
                    </p>
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
              <div className="px-5 py-3 border-t border-gray-100">
                <Link
                  href={`/doctor/patients/${dni}/studies`}
                  className="text-sm text-[#2a9d8f] hover:underline font-medium"
                >
                  Ver todos los estudios ({studies.length}) →
                </Link>
              </div>
            )}
          </>
        )}
      </div>

      {/* Historial de turnos */}
      {history.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <SectionHeader title={`Historial de turnos (${history.length})`} />
          <div className="divide-y divide-gray-100">
            {history.map((a) => {
              const { day, month, time } = formatDate(a.scheduledAt);
              return (
                <div key={a.id} className="flex items-center gap-4 px-5 py-3">
                  <div className="w-10 text-center shrink-0">
                    <p className="text-sm font-semibold text-gray-600 leading-none">
                      {day}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">
                      {month}
                    </p>
                  </div>
                  <div className="flex-1 text-sm text-gray-600">
                    {time} hs
                    {a.specialtyName && (
                      <span className="font-medium"> · {a.specialtyName}</span>
                    )}
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
