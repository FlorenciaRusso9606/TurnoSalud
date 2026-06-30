# TurnoSalud - Hospital Cervantes · Río Negro

Sistema de gestión de turnos médicos, estudios clínicos y administración hospitalaria del Hospital Cervantes, Provincia de Río Negro, Argentina.

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Recharts |
| Backend | Node.js, Express, TypeScript |
| Base de datos | PostgreSQL (Supabase) + Prisma ORM |
| Autenticación | JWT (jsonwebtoken) + bcryptjs |
| Almacenamiento | AWS S3 (estudios clínicos) |
| Notificaciones | Resend (email transaccional) |
| Tests | Jest + ts-jest + Supertest |
| CI/CD | GitHub Actions |
| Deploy | Railway (backend) · Vercel (frontend) |

## Funcionalidades por rol

**Paciente**
- Sacar y cancelar turnos médicos
- Ver historial de turnos con estado (confirmado, ausente, cancelado)
- Acceder a estudios clínicos subidos por el equipo médico
- Ver agenda de próximos turnos

**Médico**
- Agenda del día, semana o mes con filtros
- Marcar ausencia de pacientes en turnos confirmados
- Ficha clínica del paciente: datos, notas, estudios, historial de turnos
- Registrar notas clínicas por paciente

**Administrador / Recepción**
- Gestión de turnos: confirmar o cancelar solicitudes pendientes, con búsqueda por médico y paciente
- Dashboard con KPIs: total de turnos, ausentismo, demanda por especialidad y médico
- Gestión de pacientes, médicos, especialidades y usuarios (CRUD)
- Carga de disponibilidad médica por día y horario
- Carga de estudios clínicos en S3 asociados a pacientes
- Activar/desactivar cuentas de usuario
- Notificaciones por email al paciente al reservar el turno y recordatorio 24 h antes

## Arquitectura

```
turnosalud/
├── backend/                  # Express API
│   ├── prisma/               # Schema y migraciones
│   └── src/
│       ├── adapters/http/    # Controladores, rutas, middlewares, schemas Zod
│       ├── application/      # Casos de uso
│       ├── domain/           # Entidades e interfaces de repositorios
│       └── infrastructure/   # Implementaciones Prisma de repositorios
└── frontend/                 # Next.js App Router
    ├── app/
    │   ├── (auth)/           # Login y registro
    │   └── (dashboard)/      # Vistas por rol (patient / doctor / admin)
    ├── components/           # UI compartida
    └── lib/                  # Cliente API y utilidades
```

## Correr localmente

### Requisitos

- Node.js 20+
- PostgreSQL (o cuenta en Supabase)
- Cuenta AWS con bucket S3 configurado
- Cuenta en [Resend](https://resend.com) para emails (3 000 emails/mes gratis)

### Backend

```bash
cd backend
cp .env.example .env   # completar variables de entorno
npm install
npx prisma migrate dev
npm run dev
```

Variables de entorno requeridas:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=un-secreto-seguro
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=turnosalud-estudios
RESEND_API_KEY=re_...
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Tests

```bash
cd backend
npm test
```

## Deploy

### Backend - Railway

1. Crear proyecto en [Railway](https://railway.app) y conectar este repositorio
2. Seleccionar el directorio `backend` como root
3. Railway detecta el `railway.toml` automáticamente (build + start)
4. Agregar las variables de entorno en el panel de Railway
5. Agregar un servicio PostgreSQL desde Railway o conectar Supabase

### Frontend - Vercel

1. Importar el repositorio en [Vercel](https://vercel.com)
2. Configurar **Root Directory** como `frontend`
3. Framework preset: **Next.js** (autodetectado)
4. Agregar la variable `NEXT_PUBLIC_API_URL` apuntando al backend de Railway

## Teléfonos de emergencia

| Servicio | Número |
|----------|--------|
| Guardia del hospital | (0298) 444-0000 |
| Turnos | (0298) 444-0001 |
| SAME | 107 |
| Defensa Civil | 103 |
| Maltrato Infantil | 102 |
| Víctimas de Violencia | 148 |

---

Ministerio de Salud · Provincia de Río Negro
