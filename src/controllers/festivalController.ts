import type { Request, Response, NextFunction } from 'express'
import { festivalCreateSchema, festivalUpdateSchema } from '../schemas/festival.schema'
import * as festivalService from '../services/festivalService'

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const festivals = await festivalService.getAll()
    res.status(200).json(festivals)
  } catch (err) {
    next(err)
  }
}

export async function getAllWithStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const festivals = await festivalService.getAllWithStats()
    res.status(200).json(festivals)
  } catch (err) {
    next(err)
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identifiant invalide' })
      return
    }
    const festival = await festivalService.getById(id)
    res.status(200).json(festival)
  } catch (err) {
    next(err)
  }
}

export async function getByIdWithStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identifiant invalide' })
      return
    }
    const festival = await festivalService.getByIdWithStats(id)
    res.status(200).json(festival)
  } catch (err) {
    next(err)
  }
}

export async function getLatest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const festival = await festivalService.getLatest()
    res.status(200).json(festival)
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = festivalCreateSchema.parse(req.body)
    const festival = await festivalService.create(data)
    res.status(201).json(festival)
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identifiant invalide' })
      return
    }
    const data = festivalUpdateSchema.parse(req.body)
    const festival = await festivalService.update(id, data)
    res.status(200).json(festival)
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id)) {
      res.status(400).json({ error: 'Identifiant invalide' })
      return
    }
    await festivalService.remove(id)
    res.status(204).send()
  } catch (err) {
    next(err)
  }
}
