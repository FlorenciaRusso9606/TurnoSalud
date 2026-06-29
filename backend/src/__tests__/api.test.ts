import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../app'

jest.mock('../prisma', () => ({
  __esModule: true,
  default: {
    user: { findUnique: jest.fn().mockResolvedValue({ isActive: true }) },
  },
}))

const SECRET = process.env.JWT_SECRET!

const token = (role: 'PATIENT' | 'DOCTOR' | 'ADMIN', extra: object = {}) =>
  jwt.sign({ userId: 1, dni: 12345678, role, name: 'Test', lastname: 'User', ...extra }, SECRET)

describe('GET /health', () => {
  it('responds 200', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})

describe('POST /auth/login — validation', () => {
  it('returns 422 when body is empty', async () => {
    const res = await request(app).post('/auth/login').send({})
    expect(res.status).toBe(422)
  })

  it('returns 422 when DNI is not a number', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ dni: 'abc', password: '123456' })
    expect(res.status).toBe(422)
  })

  it('returns 422 when password is too short', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ dni: 12345678, password: '123' })
    expect(res.status).toBe(422)
  })
})

describe('POST /auth/register — validation', () => {
  it('returns 422 when required fields are missing', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ dni: 12345678 })
    expect(res.status).toBe(422)
  })

  it('returns 422 when password is too short', async () => {
    const res = await request(app).post('/auth/register').send({
      dni: 12345678,
      name: 'Juan',
      lastname: 'Pérez',
      birthDate: '1990-01-01',
      password: '123',
    })
    expect(res.status).toBe(422)
  })
})

describe('Auth middleware', () => {
  it('returns 401 when no token is provided', async () => {
    const res = await request(app).get('/appointments/mine')
    expect(res.status).toBe(401)
  })

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .get('/appointments/mine')
      .set('Authorization', 'Bearer not-a-valid-token')
    expect(res.status).toBe(401)
  })
})

describe('Role authorization', () => {
  it('returns 403 when DOCTOR accesses a PATIENT-only route', async () => {
    const res = await request(app)
      .get('/appointments/mine')
      .set('Authorization', `Bearer ${token('DOCTOR')}`)
    expect(res.status).toBe(403)
  })

  it('returns 403 when PATIENT accesses an ADMIN-only route', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token('PATIENT')}`)
    expect(res.status).toBe(403)
  })

  it('returns 403 when DOCTOR accesses the admin dashboard', async () => {
    const res = await request(app)
      .get('/dashboard')
      .set('Authorization', `Bearer ${token('DOCTOR')}`)
    expect(res.status).toBe(403)
  })
})
