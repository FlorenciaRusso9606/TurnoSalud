"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { api } from "@/lib/api";
import { Patient } from "@/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { AdminListCard } from "@/components/admin/AdminListCard";
import { AdminFormPanel } from "@/components/admin/AdminFormPanel";

type FormMode = "hidden" | "create" | "edit";

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filtered, setFiltered] = useState<Patient[]>([]);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<FormMode>("hidden");
  const [editing, setEditing] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dni, setDni] = useState("");
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [password, setPassword] = useState("");
  const [socialWork, setSocialWork] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    api.patients
      .getAll()
      .then((data) => {
        setPatients(data);
        setFiltered(data);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q
        ? patients.filter(
            (p) =>
              p.name.toLowerCase().includes(q) ||
              p.lastname.toLowerCase().includes(q) ||
              String(p.dni).includes(q),
          )
        : patients,
    );
  }, [search, patients]);

  const openCreate = () => {
    setDni("");
    setName("");
    setLastname("");
    setBirthDate("");
    setPassword("");
    setSocialWork("");
    setEmail("");
    setPhone("");
    setAddress("");
    setError("");
    setSuccess("");
    setEditing(null);
    setMode("create");
  };

  const openEdit = (p: Patient) => {
    setSocialWork(p.socialWork ?? "");
    setEmail(p.email ?? "");
    setPhone(p.phone ?? "");
    setAddress(p.address ?? "");
    setError("");
    setSuccess("");
    setEditing(p);
    setMode("edit");
  };

  const closeForm = () => {
    setMode("hidden");
    setEditing(null);
    setError("");
  };

  const handleCreate = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patients.create({
        dni: Number(dni),
        name,
        lastname,
        birthDate,
        password,
        socialWork: socialWork || undefined,
        email: email || undefined,
        phone: phone || undefined,
        address: address || undefined,
      });
      const updated = await api.patients.getAll();
      setPatients(updated);
      setSuccess("Paciente creado correctamente");
      setMode("hidden");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    try {
      await api.patients.update(editing.dni, {
        socialWork: socialWork || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
      });
      const updated = await api.patients.getAll();
      setPatients(updated);
      setSuccess("Paciente actualizado");
      setMode("hidden");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Gestión de Pacientes"
        action={
          mode === "hidden" ? (
            <Button
              onClick={openCreate}
              className="flex items-center gap-1.5 text-sm px-4 py-2"
            >
              <Plus size={15} />
              Nuevo paciente
            </Button>
          ) : undefined
        }
      />

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl">
          {success}
        </div>
      )}

      {mode === "create" && (
        <AdminFormPanel
          title="Nuevo paciente"
          onClose={closeForm}
          error={error}
        >
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <FormInput
              label="DNI *"
              type="number"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
            <FormInput
              label="Nombre *"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <FormInput
              label="Apellido *"
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />
            <FormInput
              label="Fecha de nacimiento *"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
            />
            <FormInput
              label="Contraseña *"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              showToggle
            />
            <FormInput
              label="Obra social"
              type="text"
              value={socialWork}
              onChange={(e) => setSocialWork(e.target.value)}
            />
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              label="Teléfono"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="col-span-2">
              <FormInput
                label="Dirección"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="col-span-2 flex gap-3 pt-1">
              <Button
                type="submit"
                loading={saving}
                loadingText="Guardando..."
                className="text-sm px-5 py-2"
              >
                Crear paciente
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                className="text-sm px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </AdminFormPanel>
      )}

      {mode === "edit" && editing && (
        <AdminFormPanel
          title={`Editar - ${editing.lastname}, ${editing.name} (DNI ${editing.dni})`}
          onClose={closeForm}
          error={error}
        >
          <form onSubmit={handleEdit} className="grid grid-cols-2 gap-4">
            <FormInput
              label="Obra social"
              type="text"
              value={socialWork}
              onChange={(e) => setSocialWork(e.target.value)}
            />
            <FormInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormInput
              label="Teléfono"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <div className="col-span-2">
              <FormInput
                label="Dirección"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <div className="col-span-2 flex gap-3 pt-1">
              <Button
                type="submit"
                loading={saving}
                loadingText="Guardando..."
                className="text-sm px-5 py-2"
              >
                Guardar cambios
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={closeForm}
                className="text-sm px-4 py-2 text-gray-500 hover:text-gray-700"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </AdminFormPanel>
      )}

      <AdminListCard
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nombre o DNI..."
        loading={loading}
        isEmpty={filtered.length === 0}
      >
        {filtered.map((p) => (
          <div key={p.dni} className="flex items-center gap-3 px-5 py-3.5">
            <div className="w-8 h-8 rounded-full bg-[#e6f5f3] flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-[#2a9d8f]">
                {p.name[0]}
                {p.lastname[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1d3557]">
                {p.lastname}, {p.name}
              </p>
              <p className="text-xs text-gray-400">
                DNI: {p.dni}
                {p.socialWork && (
                  <span className="ml-2 text-[#2a9d8f]">{p.socialWork}</span>
                )}
                {p.phone && <span className="ml-2">{p.phone}</span>}
                {p.email && <span className="ml-2">{p.email}</span>}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => openEdit(p)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 shrink-0"
            >
              <Pencil size={11} />
              Editar
            </Button>
          </div>
        ))}
      </AdminListCard>
    </div>
  );
}
