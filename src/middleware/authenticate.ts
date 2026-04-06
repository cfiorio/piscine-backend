import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AccessTokenPayload } from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token: string | undefined = req.cookies['accessToken'];
  if (!token) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }
  try {
    req.user = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ['HS256'],
    }) as unknown as AccessTokenPayload;
    next();
  } catch {
    res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter' });
  }
}
