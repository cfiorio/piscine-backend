import * as repo from '../repository/festivalRepository'
import type { Festival } from '../repository/festivalRepository'
import type { FestivalCreateInput, FestivalUpdateInput } from '../schemas/festival.schema'

export async function getAll(): Promise<Festival[]> {
  return repo.findAll()
}

export async function getById(id: number): Promise<Festival> {
  const festival = await repo.findById(id)
  if (!festival) throw new Error('FESTIVAL_NOT_FOUND')
  return festival
}

export async function getLatest(): Promise<Festival> {
  const festival = await repo.findLatest()
  if (!festival) throw new Error('FESTIVAL_NOT_FOUND')
  return festival
}

export async function create(data: FestivalCreateInput): Promise<Festival> {
  return repo.create(data)
}

export async function update(id: number, data: FestivalUpdateInput): Promise<Festival> {
  const existing = await repo.findById(id)
  if (!existing) throw new Error('FESTIVAL_NOT_FOUND')
  const updated = await repo.update(id, data)
  if (!updated) throw new Error('FESTIVAL_NOT_FOUND')
  return updated
}

export async function remove(id: number): Promise<void> {
  const deleted = await repo.remove(id)
  if (!deleted) throw new Error('FESTIVAL_NOT_FOUND')
}
