import type { RowDataPacket, ResultSetHeader } from 'mysql2'
import { pool } from '../utils/database'
import type { JeuCreateInput, JeuUpdateInput } from '../schemas/jeu.schema'

export interface Jeu {
  idJeu: number
  libelleJeu: string | null
  auteurJeu: string
  nbMinJoueurJeu: number | null
  nbMaxJoueurJeu: number | null
  noticeJeu: string | null
  idEditeur: number | null
  libelleEditeur: string | null
  idTypeJeu: number | null
  libelleTypeJeu: string | null
  agemini: number
  prototype: boolean
  duree: number
  theme: string
  description: string
  imageJeu: string
  videoRegle: string
}

// Colonnes de base avec libellés éditeur et type de jeu
const BASE_SELECT = `
  SELECT
    j.*,
    e.libelleEditeur,
    t.libelleTypeJeu
  FROM jeu j
  LEFT JOIN editeur e ON e.idEditeur = j.idEditeur
  LEFT JOIN typeJeu t ON t.idTypeJeu = j.idTypeJeu
`

export async function findAll(): Promise<Jeu[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${BASE_SELECT} ORDER BY j.libelleJeu ASC`,
  )
  return rows as Jeu[]
}

export async function findById(id: number): Promise<Jeu | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${BASE_SELECT} WHERE j.idJeu = ?`,
    [id],
  )
  return rows.length > 0 ? (rows[0] as Jeu) : null
}

export async function create(data: JeuCreateInput): Promise<Jeu> {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO jeu (
      libelleJeu, auteurJeu, nbMinJoueurJeu, nbMaxJoueurJeu, noticeJeu,
      idEditeur, idTypeJeu, agemini, prototype, duree, theme, description, imageJeu, videoRegle
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.libelleJeu ?? null,
      data.auteurJeu,
      data.nbMinJoueurJeu ?? null,
      data.nbMaxJoueurJeu ?? null,
      data.noticeJeu ?? null,
      data.idEditeur ?? null,
      data.idTypeJeu ?? null,
      data.agemini,
      data.prototype ? 1 : 0,
      data.duree,
      data.theme,
      data.description,
      data.imageJeu,
      data.videoRegle,
    ],
  )

  const jeu = await findById(result.insertId)
  if (!jeu) throw new Error('JEU_NOT_FOUND_AFTER_INSERT')
  return jeu
}

export async function update(id: number, data: JeuUpdateInput): Promise<Jeu | null> {
  // prototype est extrait séparément car tinyint(1) en SQL — la conversion boolean → 0|1
  // doit être explicite et ne peut pas être inférée via l'index générique data[f]
  const { prototype, ...rest } = data

  const setClauses: string[] = []
  const values: (string | number | null)[] = []

  for (const key of Object.keys(rest) as (keyof typeof rest)[]) {
    setClauses.push(`${key} = ?`)
    values.push(rest[key] ?? null)
  }

  if (prototype !== undefined) {
    setClauses.push('prototype = ?')
    values.push(prototype ? 1 : 0)
  }

  if (setClauses.length === 0) return findById(id)

  await pool.execute<ResultSetHeader>(
    `UPDATE jeu SET ${setClauses.join(', ')} WHERE idJeu = ?`,
    [...values, id],
  )

  return findById(id)
}

export async function remove(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    'DELETE FROM jeu WHERE idJeu = ?',
    [id],
  )
  return result.affectedRows > 0
}


// --- Jeux avec mécanismes ---

export interface JeuWithMecanismes extends Jeu {
  mecanismes: string
}

const WITH_MECANISMES_QUERY = `
  SELECT
    j.*,
    e.libelleEditeur,
    t.libelleTypeJeu,
    COALESCE(GROUP_CONCAT(m.mecaName ORDER BY m.mecaName SEPARATOR ';'), '') AS mecanismes
  FROM jeu j
  LEFT JOIN editeur e ON e.idEditeur = j.idEditeur
  LEFT JOIN typeJeu t ON t.idTypeJeu = j.idTypeJeu
  LEFT JOIN jeu_mecanism jm ON jm.idJeu = j.idJeu
  LEFT JOIN mecanism m ON m.idMecanism = jm.idMecanism
`

export async function findAllWithMecanismes(): Promise<JeuWithMecanismes[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${WITH_MECANISMES_QUERY} GROUP BY j.idJeu ORDER BY j.libelleJeu ASC`,
  )
  return rows as JeuWithMecanismes[]
}

export async function findByIdWithMecanismes(id: number): Promise<JeuWithMecanismes | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${WITH_MECANISMES_QUERY} WHERE j.idJeu = ? GROUP BY j.idJeu`,
    [id],
  )
  return rows.length > 0 ? (rows[0] as JeuWithMecanismes) : null
}


// --- Jeux du festival en cours avec mécanismes et zones ---

export interface JeuFestival extends Jeu {
  mecanismes: string
  zones: string
}

export async function findAllByLatestFestivalWithDetails(): Promise<JeuFestival[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT
      j.*,
      e.libelleEditeur,
      t.libelleTypeJeu,
      COALESCE(GROUP_CONCAT(DISTINCT m.mecaName ORDER BY m.mecaName SEPARATOR ';'), '') AS mecanismes,
      COALESCE(GROUP_CONCAT(DISTINCT z.nomZone ORDER BY z.nomZone SEPARATOR ';'), '') AS zones
    FROM jeu j
    LEFT JOIN editeur e ON e.idEditeur = j.idEditeur
    LEFT JOIN typeJeu t ON t.idTypeJeu = j.idTypeJeu
    INNER JOIN reserver r ON r.idJeu = j.idJeu
    INNER JOIN zone z ON z.idZone = r.idZone
    LEFT JOIN jeu_mecanism jm ON jm.idJeu = j.idJeu
    LEFT JOIN mecanism m ON m.idMecanism = jm.idMecanism
    WHERE r.idFestival = (SELECT MAX(idFestival) FROM festival)
    GROUP BY j.idJeu
    ORDER BY j.libelleJeu ASC`,
  )
  return rows as JeuFestival[]
}
