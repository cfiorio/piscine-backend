import * as repo from '../repository/jeuRepository'
import type { Jeu, JeuWithMecanismes, JeuFestival, EditeurFestival } from '../repository/jeuRepository'
import type { JeuCreateInput, JeuUpdateInput } from '../schemas/jeu.schema'

export async function getAll(): Promise<Jeu[]> {
  return repo.findAll()
}

export async function getById(id: number): Promise<Jeu> {
  const jeu = await repo.findById(id)
  if (!jeu) throw new Error('JEU_NOT_FOUND')
  return jeu
}

export async function create(data: JeuCreateInput): Promise<Jeu> {
  return repo.create(data)
}

export async function update(id: number, data: JeuUpdateInput): Promise<Jeu> {
  const existing = await repo.findById(id)
  if (!existing) throw new Error('JEU_NOT_FOUND')
  const updated = await repo.update(id, data)
  if (!updated) throw new Error('JEU_NOT_FOUND')
  return updated
}

export async function remove(id: number): Promise<void> {
  const deleted = await repo.remove(id)
  if (!deleted) throw new Error('JEU_NOT_FOUND')
}

export async function getAllWithMecanismes(): Promise<JeuWithMecanismes[]> {
  return repo.findAllWithMecanismes()
}

export async function getByIdWithMecanismes(id: number): Promise<JeuWithMecanismes> {
  const jeu = await repo.findByIdWithMecanismes(id)
  if (!jeu) throw new Error('JEU_NOT_FOUND')
  return jeu
}

export async function getAllByLatestFestivalWithDetails(): Promise<JeuFestival[]> {
  return repo.findAllByLatestFestivalWithDetails()
}

export async function getEditeursByLatestFestival(): Promise<EditeurFestival[]> {
  return repo.findEditeursByLatestFestival()
}
