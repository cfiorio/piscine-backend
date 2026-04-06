import { RowDataPacket } from 'mysql2';
import { pool } from '../utils/database';

export interface Organisateur {
  idOrganisateur: number;
  loginOrganisateur: string;
  motDePasseOrganisateur: string;
  admin: number | null;
  nomOrganisateur: string | null;
  prenomOrganisateur: string | null;
}

export async function findByLogin(login: string): Promise<Organisateur | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM organisateur WHERE loginOrganisateur = ?',
    [login],
  );
  return rows.length > 0 ? (rows[0] as Organisateur) : null;
}

export async function findById(id: number): Promise<Organisateur | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM organisateur WHERE idOrganisateur = ?',
    [id],
  );
  return rows.length > 0 ? (rows[0] as Organisateur) : null;
}
