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

function isAccessTokenPayload(payload: unknown): payload is AccessTokenPayload {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'sub' in payload &&
    'login' in payload &&
    typeof (payload as Record<string, unknown>)['sub'] === 'number' &&
    typeof (payload as Record<string, unknown>)['login'] === 'string'
  );
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const token: string | undefined = req.cookies['accessToken'];
  if (!token) {
    res.status(401).json({ error: 'Non authentifié' });
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
    if (!isAccessTokenPayload(payload)) {
      res.status(401).json({ error: 'Token invalide' });
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter' });
  }
}
