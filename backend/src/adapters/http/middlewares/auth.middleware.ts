import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthPayload {
  userId: number
  dni: number
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN'
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }

  const token = authHeader.split(' ')[1]
  const secret = process.env.JWT_SECRET
  if (!secret) {
    res.status(500).json({ error: 'Configuración interna inválida' })
    return
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

export const authorize = (...roles: AuthPayload['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'No tenés permisos para esta acción' })
      return
    }
    next()
  }
}