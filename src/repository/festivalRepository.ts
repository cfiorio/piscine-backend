import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../utils/database'
import type { FestivalCreateInput, FestivalUpdateInput } from '../schemas/festival.schema'

export interface Festival {
  idFestival: number
  anneeFestival: string | null
  nbEmplacementTotal: number | null
  nbEmplPremium: number
  nbEmplStandard: number
  nbEmplPromo: number
  prixEmplacementFestival: number | null
  prixEmplacementPremium: number
  prixEmplacementPromo: number
  m2EmplacementStandard: number | null
  m2EmplacementPremium: number | null
  m2EmplacementPromo: number | null
  nomEmplPremium: string
  nomEmplStandard: string
  nomEmplPromo: string
}

export async function findAll(): Promise<Festival[]> {
  const [rows] = await pool.execute<RowDataPacket[]>('SELECT * FROM festival ORDER BY idFestival DESC')
  return rows as Festival[]
}

export async function findById(id: number): Promise<Festival | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM festival WHERE idFestival = ?',
    [id],
  )
  return rows.length > 0 ? (rows[0] as Festival) : null
}

export async function findLatest(): Promise<Festival | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT * FROM festival ORDER BY idFestival DESC LIMIT 1',
  )
  return rows.length > 0 ? (rows[0] as Festival) : null
}

export async function create(data: FestivalCreateInput): Promise<Festival> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO festival (
      anneeFestival, nbEmplacementTotal, nbEmplPremium, nbEmplStandard, nbEmplPromo,
      prixEmplacementFestival, prixEmplacementPremium, prixEmplacementPromo,
      m2EmplacementStandard, m2EmplacementPremium, m2EmplacementPromo,
      nomEmplPremium, nomEmplStandard, nomEmplPromo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.anneeFestival ?? null,
      data.nbEmplacementTotal ?? null,
      data.nbEmplPremium,
      data.nbEmplStandard,
      data.nbEmplPromo,
      data.prixEmplacementFestival ?? null,
      data.prixEmplacementPremium,
      data.prixEmplacementPromo,
      data.m2EmplacementStandard ?? null,
      data.m2EmplacementPremium ?? null,
      data.m2EmplacementPromo ?? null,
      data.nomEmplPremium,
      data.nomEmplStandard,
      data.nomEmplPromo,
    ],
  )

  const festival = await findById(result.insertId)
  if (!festival) throw new Error('FESTIVAL_NOT_FOUND_AFTER_INSERT')
  return festival
}

export async function update(id: number, data: FestivalUpdateInput): Promise<Festival | null> {
  const fields = Object.keys(data) as (keyof FestivalUpdateInput)[]
  if (fields.length === 0) return findById(id)

  const setClauses = fields.map((f) => `${f} = ?`).join(', ')
  const values = fields.map((f) => data[f] ?? null)

  await pool.execute<ResultSetHeader>(
    `UPDATE festival SET ${setClauses} WHERE idFestival = ?`,
    [...values, id],
  )

  return findById(id)
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM festival WHERE idFestival = ?',
    [id],
  )
  return result.affectedRows > 0
}
