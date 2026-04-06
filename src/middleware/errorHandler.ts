import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Données invalides', details: err.flatten() });
    return;
  }

  if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
    res.status(401).json({ error: 'Identifiants incorrects' });
    return;
  }

  if (err instanceof Error && err.message === 'INVALID_REFRESH_TOKEN') {
    res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter' });
    return;
  }

  if (err instanceof Error && err.message === 'FESTIVAL_NOT_FOUND') {
    res.status(404).json({ error: 'Festival introuvable' });
    return;
  }

  logger.error(err);

  res.status(500).json({
    error: env.NODE_ENV === 'production' ? 'Erreur interne du serveur' : String(err),
  });
}
