import type { Request, Response, NextFunction } from 'express'

export function authorizeAdmin(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.admin !== 1) {
    res.status(403).json({ error: 'Accès réservé aux administrateurs' })
    return
  }
  next()
}
