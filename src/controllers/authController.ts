import type { Request, Response, NextFunction } from 'express';
import { loginSchema } from '../schemas/auth.schema';
import * as authService from '../services/authService';

const ACCESS_COOKIE = 'accessToken';
const REFRESH_COOKIE = 'refreshToken';

const accessCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict' as const,
  path: '/api/auth/refresh',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

function setTokenCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_COOKIE, accessToken, accessCookieOptions);
  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = loginSchema.parse(req.body);
    const { accessToken, refreshToken, nom, prenom } = await authService.login(input);

    setTokenCookies(res, accessToken, refreshToken);
    res.status(200).json({ message: 'Authentifié', nom, prenom });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token: string | undefined = req.cookies[REFRESH_COOKIE];
    if (!token) {
      res.status(401).json({ error: 'Refresh token manquant' });
      return;
    }

    const { accessToken, refreshToken } = await authService.refresh(token);

    setTokenCookies(res, accessToken, refreshToken);
    res.status(200).json({ message: 'Tokens renouvelés' });
  } catch (err) {
    next(err);
  }
}

export function logout(req: Request, res: Response): void {
  const token: string | undefined = req.cookies[REFRESH_COOKIE];
  if (token) {
    authService.revokeFamily(token);
  }

  res.clearCookie(ACCESS_COOKIE, { httpOnly: true, secure: true, sameSite: 'strict' });
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/api/auth/refresh',
  });
  res.status(200).json({ message: 'Déconnecté' });
}
