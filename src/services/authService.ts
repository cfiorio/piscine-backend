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
}

// Délai constant pour éviter les attaques timing (user inconnu vs mauvais mdp)
const DUMMY_HASH = '$2b$12$invalidhashfortimingprotection000000000000000000000000';

// -------------------------------------------------------------------
// Rotation des refresh tokens avec détection de réutilisation (vol)
//
// Chaque token appartient à une "famille" (chaîne d'émission).
// Si un token déjà consommé est présenté à nouveau, toute la famille
// est invalidée — signe probable d'un vol de token.
//
// NOTE production : remplacer ce Map par Redis ou une table DB pour
// gérer plusieurs instances et survivre aux redémarrages.
// -------------------------------------------------------------------
interface TokenEntry {
  sub: number;
  familyId: string;
}

// hash → TokenEntry  (uniquement les tokens valides non encore consommés)
const validRefreshTokens = new Map<string, TokenEntry>();
// familyId → set de hashs révoqués (détection de réutilisation)
const revokedFamilies = new Set<string>();

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
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
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  const refreshToken = jwt.sign(
    { sub, fid: familyId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] },
  );

  validRefreshTokens.set(hashToken(refreshToken), { sub, familyId });

  return { accessToken, refreshToken, nom, prenom };
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
    decoded = jwt.verify(incomingRefreshToken, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
  } catch {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const familyId = decoded.fid as string;
  const tokenHash = hashToken(incomingRefreshToken);

  // 2. Détecter une réutilisation (signe de vol) → invalider toute la famille
  if (revokedFamilies.has(familyId)) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  // 3. Vérifier que le token est bien dans notre registre
  const entry = validRefreshTokens.get(tokenHash);
  if (!entry) {
    // Token inconnu mais famille non révoquée → réutilisation détectée
    revokedFamilies.add(familyId);
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
    const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
    const familyId = decoded.fid as string;
    revokedFamilies.add(familyId);
    validRefreshTokens.delete(hashToken(refreshToken));
  } catch {
    // Token déjà expiré ou invalide — rien à révoquer
  }
}
