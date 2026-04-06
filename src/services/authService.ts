import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { findByLogin, findById } from '../repository/organisateurRepository';
import { env } from '../config/env';
import type { LoginInput } from '../schemas/auth.schema';

export interface AccessTokenPayload {
  sub: number;
  login: string;
  admin: number | null;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  nom: string | null;
  prenom: string | null;
  login: string;
  admin: number | null;
}

// Délai constant pour éviter les attaques timing (user inconnu vs mauvais mdp)
const DUMMY_HASH = '$2b$12$invalidhashfortimingprotection000000000000000000000000';

const JWT_ALGORITHM: jwt.Algorithm = 'HS256';

// -------------------------------------------------------------------
// Rotation des refresh tokens avec détection de réutilisation (vol)
//
// Chaque token appartient à une "famille" (chaîne d'émission).
// Si un token déjà consommé est présenté à nouveau, toute la famille
// est invalidée — signe probable d'un vol de token.
//
// NOTE production : remplacer ces Maps par Redis ou une table DB pour
// gérer plusieurs instances et survivre aux redémarrages.
// -------------------------------------------------------------------
interface TokenEntry {
  sub: number;
  familyId: string;
  expiresAt: number; // timestamp ms
}

// hash → TokenEntry  (uniquement les tokens valides non encore consommés)
const validRefreshTokens = new Map<string, TokenEntry>();
// familyId → expiresAt ms (familles révoquées, conservées jusqu'à expiration naturelle)
const revokedFamilies = new Map<string, number>();

// Purge des entrées expirées toutes les heures pour éviter la fuite mémoire
setInterval(() => {
  const now = Date.now();
  for (const [hash, entry] of validRefreshTokens) {
    if (entry.expiresAt < now) validRefreshTokens.delete(hash);
  }
  for (const [fid, exp] of revokedFamilies) {
    if (exp < now) revokedFamilies.delete(fid);
  }
}, 60 * 60 * 1000).unref(); // .unref() : ne bloque pas l'arrêt du process

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function refreshExpiresAt(): number {
  // Calcul du TTL à partir de la valeur d'env (ex. "7d" → 7 * 86400 * 1000 ms)
  const raw = env.JWT_REFRESH_EXPIRES_IN;
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) return Date.now() + 7 * 24 * 60 * 60 * 1000;
  const value = parseInt(match[1], 10);
  const unit: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Date.now() + value * (unit[match[2]] ?? 86_400_000);
}

function issueTokens(
  sub: number,
  login: string,
  admin: number | null,
  nom: string | null,
  prenom: string | null,
  familyId: string,
): Tokens {
  const payload: AccessTokenPayload = { sub, login, admin };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(
    { sub, fid: familyId },
    env.JWT_REFRESH_SECRET,
    {
      algorithm: JWT_ALGORITHM,
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    },
  );

  validRefreshTokens.set(hashToken(refreshToken), {
    sub,
    familyId,
    expiresAt: refreshExpiresAt(),
  });

  return { accessToken, refreshToken, nom, prenom, login, admin };
}

// -------------------------------------------------------------------

export async function login(input: LoginInput): Promise<Tokens> {
  const organisateur = await findByLogin(input.login);

  const hashToCompare = organisateur?.motDePasseOrganisateur ?? DUMMY_HASH;
  const valid = await bcrypt.compare(input.motDePasse, hashToCompare);

  if (!organisateur || !valid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const familyId = crypto.randomUUID();
  return issueTokens(
    organisateur.idOrganisateur,
    organisateur.loginOrganisateur,
    organisateur.admin,
    organisateur.nomOrganisateur,
    organisateur.prenomOrganisateur,
    familyId,
  );
}

export async function refresh(incomingRefreshToken: string): Promise<Tokens> {
  // 1. Vérifier la signature et l'expiration JWT
  let decoded: jwt.JwtPayload;
  try {
    decoded = jwt.verify(incomingRefreshToken, env.JWT_REFRESH_SECRET, {
      algorithms: [JWT_ALGORITHM],
    }) as jwt.JwtPayload;
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const familyId = decoded.fid;
  if (typeof familyId !== 'string') {
    throw new Error('INVALID_REFRESH_TOKEN');
  }
  const tokenHash = hashToken(incomingRefreshToken);

  // 2. Détecter une réutilisation (signe de vol) → invalider toute la famille
  if (revokedFamilies.has(familyId)) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // 3. Vérifier que le token est bien dans notre registre
  const entry = validRefreshTokens.get(tokenHash);
  if (!entry) {
    // Token inconnu mais famille non révoquée → réutilisation détectée
    revokedFamilies.set(familyId, refreshExpiresAt());
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // 4. Consommer le token (rotation)
  validRefreshTokens.delete(tokenHash);

  // 5. Récupérer les données à jour de l'organisateur
  const organisateur = await findById(entry.sub);
  if (!organisateur) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // 6. Émettre une nouvelle paire — même famille, token différent
  return issueTokens(
    organisateur.idOrganisateur,
    organisateur.loginOrganisateur,
    organisateur.admin,
    organisateur.nomOrganisateur,
    organisateur.prenomOrganisateur,
    familyId,
  );
}

export function revokeFamily(refreshToken: string): void {
  try {
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
      algorithms: [JWT_ALGORITHM],
    }) as jwt.JwtPayload;
    const familyId = decoded.fid;
    if (typeof familyId !== 'string') return;
    revokedFamilies.set(familyId, refreshExpiresAt());
    validRefreshTokens.delete(hashToken(refreshToken));
  } catch {
    // Token déjà expiré ou invalide — rien à révoquer
  }
}
